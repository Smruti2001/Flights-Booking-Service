const { StatusCodes } = require('http-status-codes');
const amqplib = require('amqplib');

const AppError = require('../utils/errors/appError');

const queue = 'NotificationQueue';
let channel;

async function connectQueue() {
    try {
        connection = await amqplib.connect('amqp://localhost');
        channel = await connection.createChannel();
        channel.assertQueue(queue);
    } catch (error) {
        console.log('Error while connecting Queue', error);
        throw new AppError(['Something went wrong while connecting to queue'], StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function sendData(data) {
    try {
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    } catch (error) {
        console.log('Error while sending data into the Queue', error);
        throw new AppError(['Something went wrong while sending data to queue'], StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    connectQueue,
    sendData
}