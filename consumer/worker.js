var Beanworker = require('fivebeans').worker;

var config = require('../config.js');
var ExchagneHandler = require('./exchange_handler.js').ExchagneHandler;

var options =
{
    id: 'worker_4',
    host: config.beanstalk.host || '127.0.0.1',
    port: config.beanstalk.port || 11300,
    handlers:
    {
        exchange_rate: new ExchagneHandler(config)
    },
    ignoreDefault: true
};

var worker = new Beanworker(options);
worker.start([config.beanstalk.tube || 'zan768616253']);