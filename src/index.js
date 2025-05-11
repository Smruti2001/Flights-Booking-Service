const express = require('express');
const { ServerConfig, Logger } = require('./config');
const apiRouter = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter);

app.listen(ServerConfig.PORT, () => {
    console.log(`Server started at PORT: ${ServerConfig.PORT}`);
    Logger.info('This is a test info log to check the working of logging mechanism');
})