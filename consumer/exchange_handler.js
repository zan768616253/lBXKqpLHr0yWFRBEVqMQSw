'use strict';

var Promise = require('bluebird');
var request = require('request');
var format = require('string-template');
var $$ = require('cheerio');

var Rate = require('./models/rate.js');

var RATE_URL = 'http://www.xe.com/currencyconverter/convert/?Amount=1&From={from}&To={to}#converter';

var ExchagneHandler = function (config) {
    this.success_delay = config.handler.success_delay || 60000;
    this.fail_delay = config.handler.fail_delay || 3000;
    this.success_max_count = config.handler.success_max_count || 10;
    this.fail_max_count = config.handler.fail_max_count || 3;
    this.success_count = 0;
    this.fail_count = 0;
}

ExchagneHandler.prototype.work = function (payload, callback) {
    var self = this;
    if (self.checkStatus) {
        self.getJob(payload)
            .then(self.getRate.bind(self), self.handleError.bind(self))
            .then(self.saveRate.bind(self), self.handleError.bind(self))
            .then(self.handleWorkSuccess.bind(self), self.handleWorkFailed.bind(self))
    } else {
        if (self.IsWorkSuccess) {
            callback('success');
        } else {
            callback('bury');
        }
    }
}

ExchagneHandler.prototype.getJob = function (payload) {
    return new Promise(function (resolve, reject) {
        try {
            var jobInfo = JSON.parse(payload);
            var currency = {
                jobID: jobInfo.jobid,
                from: jobInfo.from,
                to: jobInfo.to
            };
            resolve(currency);
        } catch (e) {
            reject(new BeanStalkError('beanstalk get job data error'));
        }

    })
}

ExchagneHandler.prototype.getRate = function (currency) {
    return new Promise(function (resolve, reject) {
        request.get(format(RATE_URL, {from: currency.from, to: currency.to}), function (err, res, html) {
            if (err) {
                reject(new RateError('rate request error'));
            }
            var $ = $$.load(html);
            if ($('.rightCol').eq(0).text()) {
                var rateValue = convertRate($('.rightCol').eq(0).text());
                if (rateValue > 0) {
                    var rate = new Rate();
                    rate.jobID = currency.jobID
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
    })
}

ExchagneHandler.prototype.saveRate = function (rate) {
    var self = this;
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
}

ExchagneHandler.prototype.handleError = function (err) {
    return new Promise (function (resolve, reject) {
        reject(err);
    })
}

ExchagneHandler.prototype.handleWorkSuccess = function () {
    var self = this;
    self.success_count++;
    setTimeout(self.work.bind(self), this.success_delay);
}

ExchagneHandler.prototype.handleWorkFailed = function () {
    var self = this;
    self.fail_count++;
    setTimeout(self.work.bind(self), this.fail_delay);
}

ExchagneHandler.prototype.checkStatus = function () {
    var self = this;
    var process;
    if (self.success_count == 10 || self.fail_count == 3) {
        process = false;
    } else {
        process = true;
    }
    return process;
};

ExchagneHandler.prototype.IsWorkSuccess = function () {
    var self = this;
    var is_success;
    if (self.success_count == 10) {
        is_success = true;
    } else {
        is_success = false;
    }
    return is_success;
}

function convertRate (rate) {
    if(rate) {
        rate = rate.split(" ")[0];
        if(!isNaN(parseFloat(rate))) {
            return parseFloat(rate).toFixed(2);
        }
    } else {
        return rate
    }
}

function MongoError (message) {
    this.message = message;
    this.name = "MongoError";
    Error.captureStackTrace(this, MongoError);
}

function BeanStalkError (message) {
    this.message = message;
    this.name = "BeanStalkError";
    Error.captureStackTrace(this, BeanStalkError);
}

function RateError (message) {
    this.message = message;
    this.name = "RateError";
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
}
