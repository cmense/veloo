// Load required packages
var mongoose = require('mongoose');

// Define our booking schema
var Booking = new mongoose.Schema({
    status: String,
    startDate: Date,
    endDate: Date,
    bicycle: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Bicycle'
     },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    endUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
});

// Export the Mongoose model
module.exports = mongoose.model('Booking', Booking);
