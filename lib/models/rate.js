'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let config = require('../../bin/config.js');

let RateSchema = new Schema({
	from: {type: String},
	to: {type: String},
	created_at: {type: Date},
	rate: {type: String}
});

RateSchema.pre('save', function (next) {
	let rate = this;
	rate.created_at = new Date();
	next();
});

mongoose.connect(config.db.url, function (err) {
	if (err) {
		console.error('connect to %s error: ', config.db, err.message);
		process.exit(1);
	}
});

let Rate = mongoose.model('Rate', RateSchema);

module.exports = Rate;
