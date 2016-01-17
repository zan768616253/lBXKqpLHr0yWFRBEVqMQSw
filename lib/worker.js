'use strict';

let Beanworker = require('fivebeans').worker;

let config = require('../bin/config.js');
let ExchagneHandler = require('./exchange_handler.js').ExchagneHandler;

let options =
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

let worker = new Beanworker(options);
worker.start([config.beanstalk.tube || 'zan768616253']);
