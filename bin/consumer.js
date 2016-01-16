'use strict';

var Promise = require('bluebird');
var cp = require('child_process');
var path = require('path');

var config = require('./config.js');

var root = path.join(__dirname, '../');

(function () {
    return new Promise(function (resolve, reject) {
        try {
            var fork_num = config.consumer.fork_num || 2;
            for (var i = 0; i < fork_num; i++) {
                cp.fork(root + 'lib/worker.js');
                console.log('fork process ' + i);
            }
            resolve(fork_num);
        } catch (err) {
            reject(new ForkError('process fork error'))
        }
    })
})()


function ForkError (message) {
    this.message = message;
    this.name = "ForkError";
    Error.captureStackTrace(this, ForkError);
}
ForkError.prototype = Object.create(Error.prototype);
ForkError.prototype.constructor = ForkError;

