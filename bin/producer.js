'use strict';

let co = require('co');
let fivebeans = require('fivebeans');

let config = require('./config.js');
let BeanStalkError = require('../lib/exchange_handler.js').Error.BeanStalkError;

let host = config.beanstalk.host || '127.0.0.1';
let port = config.beanstalk.port || 11300;
let tube = config.beanstalk.tube || 'zan768616253';
let input = JSON.stringify(config.producer.seed);

console.log(input);

let createClient = function () {
	return new Promise(function (resolve, reject) {
		try {
			let client = new fivebeans.client(host, port);
			resolve(client);
		} catch (err) {
			reject(new BeanStalkError('beanstalk create client error'));
		}
	});
};

let produceJob = function (client) {
	return new Promise(function (resolve, reject) {
		if (client) {
			client.on('connect', function () {
				client.use(tube, function (err, tubename) {
					if (err) {
						reject(new BeanStalkError('beanstalk client connect error'));
					}
					client.put(1, 0, 3000, input, function (e, jobid) {
						if (e) {
							reject(new BeanStalkError('beanstalk produce job error'));
						}
						console.log(jobid);
						client.end();
						resolve();
					});
				});
			})
			.on('error', function (err) {
			})
			.on('close', function () {
			})
			.connect();
		} else {
			reject(new BeanStalkError('beanstalk client undefined error'));
		}
	});
};

co(function* () {
	let client = yield createClient();
	yield produceJob(client);
}).catch(function (err) {
	console.log(err.message);
});
