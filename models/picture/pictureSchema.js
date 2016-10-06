// Load required packages
var mongoose = require('mongoose');

// Define our movie schema
var Picture = new mongoose.Schema({
    data: {
        type: String
    },
    contentType: {
        type: String
    },
    description: String,
},
{
    timestamps: true
});

// Export the Mongoose model
module.exports = mongoose.model('Picture', Picture);
