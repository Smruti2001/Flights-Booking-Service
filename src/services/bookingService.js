const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { ServerConfig } = require('../config');
const AppError = require('../utils/errors/appError');
const db = require('../models');
const BookingRepository = require('../repositories/bookingRepository');
const bookingrepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction(); 
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`);
        const flightData = flight.data.data;
        if(data.noOfSeats > flightData.totalSeats) {
            throw new AppError(['Not enough seats available'], StatusCodes.BAD_REQUEST);
        }

        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
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

module.exports = {
    createBooking
}