'use strict';

var Promise = require('bluebird');
var fivebeans = require('fivebeans');

var config = require('./config.js');
var BeanStalkError = require('../lib/exchange_handler.js').Error.BeanStalkError;

var host = config.beanstalk.host || '127.0.0.1';
var port = config.beanstalk.port || 11300;
var tube = config.beanstalk.tube || 'zan768616253';
var input = JSON.stringify(config.producer.seed);
console.log(input);

var createClient = function () {
    return new Promise(function (resolve, reject) {
        try {

            var client = new fivebeans.client(host, port);
            resolve(client);
        } catch (err) {
            reject(new BeanStalkError('beanstalk create client error'));
        }
    })
};

var produceJob = function (client) {
    return new Promise(function (resolve, reject) {
        if (client) {
            client.on('connect', function() {
                client.use(tube, function (err, tubename) {
                    if (err) {
                        reject(new BeanStalkError('beanstalk client connect error'));
                    }
                    client.put(1, 0, 100, input, function (err, jobid) {
                        if (err) {
                            reject(new BeanStalkError('beanstalk produce job error'));
                        }
                        console.log(jobid);
                        client.end();
                    })
                })
            })
            .on('error', function(err)
            {
            })
            .on('close', function()
            {
            })
            .connect();
        } else {
            reject(new BeanStalkError('beanstalk client undefined error'));
        }
    })
};

createClient()
    .then(produceJob, function(err) {
        console.log(err.message);
    }
);