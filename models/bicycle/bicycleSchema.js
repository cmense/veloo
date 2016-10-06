// Load required packages
var mongoose = require('mongoose');

// Define our bicycle schema
var Bicycle = new mongoose.Schema({
    type: String, //defines: MTB / Rennrad ...
    size: String,
    gears: Number,
    price: Number,
    carrier: Boolean,
    brand: String,
    city: String,
    street: String,
    zipcode: Number,
    features: [{
        feature: String,
        isSelected: Boolean
    }],
    location: {
        type: [Number], //[lng, lat]
        index: '2d'
    },
    isActive: Boolean,
    category: String, //Male, female, child
    pictures: [{
        data: {
            type: String
        },
        contentType: {
            type: String
        },
        description: String
    }],
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Export the Mongoose model
module.exports = mongoose.model('Bicycle', Bicycle);
