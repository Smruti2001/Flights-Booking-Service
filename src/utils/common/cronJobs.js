const cron = require('node-cron');
const { BookingService } = require('../../services');

function scheduleCrons() {
    cron.schedule('*/30 * * * *', async() => {
        // console.log('running a task every 30 mins');
        await BookingService.cancelOldBookings();
    });
}

module.exports = scheduleCrons;