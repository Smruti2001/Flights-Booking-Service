const express = require('express');
const { PingCheckController } = require('../../controllers');
const bookingRouter = require('./bookingRoute');

const v1Router = express.Router();

v1Router.use('/bookings', bookingRouter);
v1Router.get('/ping', PingCheckController.pingCheck);

module.exports = v1Router;