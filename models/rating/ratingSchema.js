// Load required packages
var mongoose = require('mongoose');

// Define our feature schema
var Rating = new mongoose.Schema({
    ratingText: String,
    starRating: Number,
    published: Boolean,
    rater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ratedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }
},
{
    timestamps: true
});

// Export the Mongoose model
module.exports = mongoose.model('Rating', Rating);
