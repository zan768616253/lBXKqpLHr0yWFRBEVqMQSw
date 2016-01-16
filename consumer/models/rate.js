var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('../../config.js');

var RateSchema = new Schema({
    jobID: { type: String },
    from: { type: String },
    to: { type: String },
    date: { type: Date },
    rate: { type: String }
});

RateSchema.pre('save', function(next) {
    var rate = this;
    rate.date = new Date();
    next();
});

mongoose.connect(config.db.url, function (err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

var Rate = mongoose.model('Rate', RateSchema);

module.exports = Rate;