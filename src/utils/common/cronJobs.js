const { CronJob } = require('cron');

const { BookingService } = require('../../services');

const job = new CronJob(
    '*/30  * * * *', // cronTime
    async () => {
        // console.log('You will see this message every 10 second');
        await BookingService.cancelOldBookings();
        // console.log('Updated the bookings table with the status as cancelled')
    }, // onTick
    null, // onComplete
    false, // start
    'Asia/Calcutta' // timeZone
);

// job.start(); // If you want to manually start the job then make the 4th param false and use job.start

module.exports = job;