'use strict';

let chai = require('chai');
let expect = chai.expect;

let ExchagneHandler = require('../lib/exchange_handler.js').ExchagneHandler;
let BeanStalkError = require('../lib/exchange_handler.js').Error.BeanStalkError;
let config = require('../bin/config.js');

describe('lib/exchange_handler.js', function () {
	this.timeout(30000);

	let handler;

	beforeEach(function () {
		handler = new ExchagneHandler(config);
	});

	it('should get rate', function (done) {
		let currency = {
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

	it('should save the rate', function (done) {
		let currency = {
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

	it('should tell the error type', function (done) {
		(function () {
			return new Promise(function (resolve, reject) {
				reject(new BeanStalkError('beanstalk random error'));
			});
		})().then(function () {done();}, function (error) {
			expect(error.name).to.be.eql('BeanStalkError');
			done();
		});
	});

	it('should work success', function (done) {
		handler.success_delay = 50;
		handler.fail_delay = 50;

		let payload_data = {
			from: 'USD',
			to: 'HKD'
		};

		handler.work(payload_data, function	(result) {
			expect(handler.success_count).to.eql(0);
			expect(handler.fail_count).to.eql(0);
			console.log('result: ' + result);
			done();
		});
	});

	it('should work failed', function (done) {
		handler.success_delay = 50;
		handler.fail_delay = 50;

		let payload_data = {
			from: 'UNKNOWN',
			to: 'HKD'
		};

		handler.work(payload_data, function	(result) {
			expect(handler.success_count).to.eql(0);
			expect(handler.fail_count).to.eql(0);
			console.log('result: ' + result);
			done();
		});
	});
});
