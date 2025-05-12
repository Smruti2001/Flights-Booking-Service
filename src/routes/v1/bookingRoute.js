const express = require('express');
const { BookingController } = require('../../controllers');

const bookingRouter = express.Router();

bookingRouter.post('/', BookingController.createBooking);
bookingRouter.post('/payments', BookingController.makePayment);

module.exports = bookingRouter;