const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { ServerConfig } = require('../config');
const AppError = require('../utils/errors/appError');
const db = require('../models');
const BookingRepository = require('../repositories/bookingRepository');
const bookingrepository = new BookingRepository();
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

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    } catch (error) {
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

module.exports = {
    createBooking,
    makePayment
}