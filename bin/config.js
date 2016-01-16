'use strict';

var config = {
    db: {
        url: 'mongodb://test:test@ds041693.mongolab.com:41693/aftershiptest',
        user: 'test',
        password: 'test'
    },
    beanstalk: {
        host: 'challenge.aftership.net',
        port: 11300,
        tube: 'zan768616253'
    },
    handler: {
        success_delay: 60,
        fail_delay: 3,
        success_max_count: 10,
        fail_max_count: 3
    },
    consumer: {
        fork_num: 1
    },
    producer: {
        seed: {
            type: 'exchange_rate',
            payload: {
                from: 'USD',
                to: 'HKD'
            }
        }

    }
}

module.exports = config;