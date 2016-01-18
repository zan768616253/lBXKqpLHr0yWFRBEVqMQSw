'use strict';

let co = require('co');
let request = require('request');
let format = require('string-template');
let $$ = require('cheerio');

let Rate = require('./models/rate.js');

let RATE_URL = 'http://www.xe.com/currencyconverter/convert/?Amount=1&From={from}&To={to}#converter';

let ExchagneHandler = function (config) {
	this.success_delay = config.handler.success_delay || 60000;
	this.fail_delay = config.handler.fail_delay || 3000;
	this.success_max_count = config.handler.success_max_count || 10;
	this.fail_max_count = config.handler.fail_max_count || 3;
	this.success_count = 0;
	this.fail_count = 0;
};

ExchagneHandler.prototype.work = function (payload, callback) {
	let self = this;
	if (self.checkStatus()) {
		co(function* () {
			let currency = yield self.getJob(payload);
			let rate_in = yield self.getRate(currency);
			let rate_out = yield self.saveRate(rate_in);

			if (rate_out) {
				self.success_count++;
				console.log('success for ' + self.success_count + ' release job, delay for ' + self.success_delay + 'ms');
				yield self.delayWork(self.success_delay);
				self.work(payload, callback);
			} else {
				self.fail_count++;
				console.log('fail for ' + self.fail_count + ' release job, delay for ' + self.fail_delay + 'ms');
				yield self.delayWork(self.fail_delay);
				self.work(payload, callback);
			}
		}).catch(function (err) {
			co(function* () {
				self.fail_count++;
				console.log('fail for ' + self.fail_count + ' for the error of ' + err.message + ' release job, delay for ' + self.fail_delay + 'ms');
				yield self.delayWork(self.fail_delay);
				self.work(payload, callback);
			});
		});
	} else {
		if (self.isWorkSuccess()) {
			self.fail_count = 0;
			self.success_count = 0;
			console.log('job is success');
			callback('success');
		} else {
			self.fail_count = 0;
			self.success_count = 0;
			console.log('job is bury');
			callback('bury');
		}
	}
};

ExchagneHandler.prototype.getJob = function (payload) {
	return new Promise(function (resolve, reject) {
		try {
			let currency = {
				from: payload.from,
				to: payload.to
			};
			resolve(currency);
		} catch (e) {
			reject(new BeanStalkError('beanstalk get job data error'));
		}
	});
};

ExchagneHandler.prototype.getRate = function (currency) {
	return new Promise(function (resolve, reject) {
		request.get(format(RATE_URL, {from: currency.from, to: currency.to}), function (err, res, html) {
			if (err) {
				reject(new RateError('rate request error'));
			}
			let $ = $$.load(html);
			if ($('.rightCol').eq(0).text()) {
				let rateValue = convertRate($('.rightCol').eq(0).text());
				if (rateValue > 0) {
					let rate = new Rate();
					rate.from = currency.from;
					rate.to = currency.to;
					rate.rate = rateValue;
					return resolve(rate);
				} else {
					reject(new RateError('rate convertion error'));
				}
			} else {
				reject(new RateError('html analysis error'));
			}
		});
	});
};

ExchagneHandler.prototype.saveRate = function (rate) {
	return new Promise(function (resolve, reject) {
		if (rate) {
			rate.save(function (err) {
				if (err) {
					reject(new MongoError('rate save error'));
				}
				resolve(rate);
			});
		} else {
			reject(new MongoError('rate transfer error'));
		}
	});
};

ExchagneHandler.prototype.handleError = function (err) {
	return new Promise(function (resolve, reject) {
		reject(err);
	});
};

ExchagneHandler.prototype.checkStatus = function () {
	let self = this;
	let in_process;
	if (self.success_count === this.success_max_count || self.fail_count === this.fail_max_count) {
		in_process = false;
	} else {
		in_process = true;
	}
	return in_process;
};

ExchagneHandler.prototype.isWorkSuccess = function () {
	let self = this;
	let is_success;
	if (self.success_count === this.success_max_count) {
		is_success = true;
	} else {
		is_success = false;
	}
	return is_success;
};

ExchagneHandler.prototype.delayWork = function (interval) {
	return new Promise(function (resolve, reject) {
		setTimeout(resolve, interval);
	});
};

function convertRate(rate) {
	if (rate) {
		rate = rate.split(' ')[0];
		if (!isNaN(parseFloat(rate))) {
			return parseFloat(rate).toFixed(2);
		}
	} else {
		return rate;
	}
}

function MongoError(message) {
	this.message = message;
	this.name = 'MongoError';
	Error.captureStackTrace(this, MongoError);
}

function BeanStalkError(message) {
	this.message = message;
	this.name = 'BeanStalkError';
	Error.captureStackTrace(this, BeanStalkError);
}

function RateError(message) {
	this.message = message;
	this.name = 'RateError';
	Error.captureStackTrace(this, RateError);
}

RateError.prototype = Object.create(Error.prototype);
RateError.prototype.constructor = RateError;
BeanStalkError.prototype = Object.create(Error.prototype);
BeanStalkError.prototype.constructor = BeanStalkError;
MongoError.prototype = Object.create(Error.prototype);
MongoError.prototype.constructor = MongoError;

module.exports.ExchagneHandler = ExchagneHandler;
module.exports.Error = {
	BeanStalkError: BeanStalkError,
	MongoError: MongoError,
	RateError: RateError
};
