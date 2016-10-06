// Load required packages
var mongoose = require('mongoose');

// Define our message schema
var Message = new mongoose.Schema({
    text: String,
    isRead: Boolean,
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
});

// Export the Mongoose model
module.exports = mongoose.model('Message', Message);
