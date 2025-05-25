const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { ServerConfig, Queue } = require('../config');
const AppError = require('../utils/errors/appError');
const db = require('../models');
const BookingRepository = require('../repositories/bookingRepository');
const SeatBookingRepository = require('../repositories/seatBookingRepository');
const bookingrepository = new BookingRepository();
const seatBookingrepository = new SeatBookingRepository();
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`);
        const flightData = flight.data.data;
        if (data.noOfSeats > flightData.totalSeats) {
            throw new AppError(['Not enough seats available'], StatusCodes.BAD_REQUEST);
        }

        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = { ...data, totalCost: totalBillingAmount };
        const booking = await bookingrepository.create(bookingPayload, transaction);
        const seatBooking = await seatBookingrepository.create({
            bookingId: booking.id,
            flightId: data.flightId,
            seatId: data.seatId
        }, transaction);
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    } catch (error) {
        console.log('Error from createBooking', error);
        await transaction.rollback();
        throw error; // Need to handle errors other than the one explicitly thrown above
    }
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const booking = await bookingrepository.get(data.bookingId, transaction);
        const bookingTime = new Date(booking.createdAt);
        const currentTime = new Date();

        if (currentTime - bookingTime > 300000) {
            await cancelBooking(data.bookingId);
            throw new AppError(['Booking expired'], StatusCodes.BAD_REQUEST);
        }
        if (booking.totalCost != data.totalCost) {
            throw new AppError(['The amount of payment doesnt match'], StatusCodes.BAD_REQUEST);
        }
        if (booking.userId != data.userId) {
            throw new AppError(['The userId doesnt match'], StatusCodes.BAD_REQUEST);
        }

        // We'll assume here that the Payment has been successfull
        await bookingrepository.update(data.bookingId, { status: BOOKED }, transaction);
        transaction.commit();
        // TODO: Send the details of Booking
        Queue.sendData({
            recepientEmail: 'mystique478@gmail.com',
            subject: 'Flight booked',
            text: `Booking successfully done for the booking ${data.bookingId}`
        });
    } catch (error) {
        await transaction.rollback();
        throw error; // Need to handle errors other than the one explicitly thrown above
    }
}

async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const booking = await bookingrepository.get(bookingId, transaction);
        if (booking.status == CANCELLED) {
            await transaction.commit();
            return true;
        }
        await bookingrepository.update(bookingId, { status: CANCELLED }, transaction);
        await seatBookingrepository.update(bookingId, { status: Enums.SEAT_STATUS.CANCELLED }, transaction);
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${booking.flightId}/seats`, {
            seats: booking.noOfSeats,
            dec: 0
        });
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error; // Need to handle errors other than the one explicitly thrown above
    }
}

async function cancelOldBookings() {
    const transaction = await db.sequelize.transaction();
    try {
        const currentTime = new Date(Date.now() - 300000); // 5 mins before current time
        const bookingIds = await bookingrepository.cancelOldBookings(currentTime, transaction);
        const seatBookings = await seatBookingrepository.cancelOldSeatBookings(bookingIds, transaction);
        console.log('seatBookings', seatBookings);
        // After this group the seatBookingData as {flightId: {seatCount: , seatIds: []}} 
        // then call the update function to make the seats available for booking
        // TODO: After cancelling the booking make available the cancelled seats for booking. 
        // Basically call the updateSeats API to update the cancelled seats
        await transaction.commit();
        return seatBookings;
    } catch (error) {
        await transaction.rollback();
        throw error; // Need to handle errors other than the one explicitly thrown above
    }
}

module.exports = {
    createBooking,
    makePayment,
    cancelOldBookings
}