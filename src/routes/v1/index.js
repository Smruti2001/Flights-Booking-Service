const express = require('express');
const { PingCheckController } = require('../../controllers');

const v1Router = express.Router();

v1Router.get('/ping', PingCheckController.pingCheck);

module.exports = v1Router;