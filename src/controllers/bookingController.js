const { StatusCodes } = require('http-status-codes');

const { ErrorResponse, SuccessResponse } = require('../utils/common');
const { BookingService } = require('../services');

const inMemoryDb = {};

async function createBooking(req, res) {
    try {
        const booking = await BookingService.createBooking({
            flightId: req.body.flightId,
            noOfSeats: req.body.noOfSeats,
            userId: req.body.userId
        });
        SuccessResponse.message = 'Successfully created a booking';
        SuccessResponse.data = booking;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function makePayment(req, res) {
    try {
        const idempotencyKey = req.headers['x-idempotency-key'];
        if(!idempotencyKey) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: 'Idempotency key not found in the headers'});
        }
        if(inMemoryDb[idempotencyKey]) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: 'Cannot retry a successfull payment'});
        }
        const paymentResponse = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            totalCost: req.body.totalCost,
            userId: req.body.userId
        });
        inMemoryDb[idempotencyKey] = idempotencyKey;
        SuccessResponse.message = 'Payment successfull';
        SuccessResponse.data = paymentResponse;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    makePayment
}