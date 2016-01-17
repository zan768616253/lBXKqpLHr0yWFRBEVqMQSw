'use strict';

let cp = require('child_process');
let path = require('path');

let config = require('./config.js');

(function () {
	return new Promise(function (resolve, reject) {
		try {
			let fork_num = config.consumer.fork_num || 2;
			for (let i = 0; i < fork_num; i++) {
				cp.fork(path.join(__dirname, '../') + 'lib/worker.js');
				console.log('fork process ' + i);
			}
			resolve(fork_num);
		} catch (err) {
			reject(new ForkError('process fork error'));
		}
	});
})();


function ForkError(message) {
	this.message = message;
	this.name = 'ForkError';
	Error.captureStackTrace(this, ForkError);
}
ForkError.prototype = Object.create(Error.prototype);
ForkError.prototype.constructor = ForkError;

