const express = require('express');
const { ServerConfig, Logger, Queue } = require('./config');
const apiRouter = require('./routes');
const executeCron = require('./utils/common/cronJobs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Server started at PORT: ${ServerConfig.PORT}`);
    Logger.info('This is a test info log to check the working of logging mechanism');
    executeCron.start();
    await Queue.connectQueue();
    console.log('Queue connected');
})