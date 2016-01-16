'use strict';

var Promise = require('bluebird');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should;

var ExchagneHandler = require('../lib/exchange_handler.js').ExchagneHandler;
var BeanStalkError = require('../lib/exchange_handler.js').Error.BeanStalkError;
var config = require('../bin/config.js');

describe('consumer/exchange_handler.js', function () {
    this.timeout(20000);

    var handler;

    beforeEach(function () {
        handler = new ExchagneHandler(config);
    })

    it ('should get rate', function (done) {
        var currency = {
            jobID: getRandomInt(1, 10000),
            from: 'USD',
            to: 'HKD'
        };
        handler.getRate(currency)
            .then(function (rate) {
                expect(rate).to.exist;
                done();
            }, function (err) {
                expect(err).to.eql(undefined);
                done();
            });
    });

    it ('should save the rate', function (done) {
        var currency = {
            from: 'USD',
            to: 'HKD'
        };

        handler.getRate(currency)
            .then(handler.saveRate.bind(handler), function (err) {
                expect(err).to.eql(undefined);
                done();
            })
            .then(function (rate) {
                expect(rate).to.exist;
                done();
            }, function (err) {
                expect(err).to.eql(undefined);
                done();
            });
    });

    it ('should tell the error type', function (done) {
        (function () {
            return new Promise (function (resolve, reject) {
                reject(new BeanStalkError('beanstalk random error'));
            })
        })().then(function () { done() }, function (error) {
            expect(error.name).to.be.eql('BeanStalkError');
            done();
        })
    });

    it ('should work ok', function (done) {
        var currency = {
            jobID: getRandomInt(1, 10000),
            from: 'USD',
            to: 'HKD'
        };

        handler.success_delay = 10;

        var resolveCurrency = function () {
            return new Promise(function (resolve, reject) {
                handler.currency = currency;
                resolve(currency);
            })
        };


        ExchagneHandler.prototype.handleWorkSuccess = function () {
            var self = this;
            self.success_count++;
            console.log('success for ' + self.success_count);
            setTimeout(self.work.bind(self), this.success_delay);
        }

        ExchagneHandler.prototype.handleWorkFailed = function (err) {
            var self = this;
            self.fail_count++;
            console.log(err.message);
            setTimeout(self.work.bind(self), this.fail_delay);
        }

        ExchagneHandler.prototype.work = function () {
            var self = this;
            if (self.checkStatus()) {
                resolveCurrency()
                    .then(self.getRate.bind(self), self.handleError.bind(self))
                    .then(self.saveRate.bind(self), self.handleError.bind(self))
                    .then(self.handleWorkSuccess.bind(self), self.handleWorkFailed.bind(self))
            } else {
                done();
            }
        }

        resolveCurrency()
            .then(handler.work.bind(handler));
    })
})

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}