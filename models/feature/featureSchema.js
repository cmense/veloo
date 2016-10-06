// Load required packages
var mongoose = require('mongoose');

// Define our feature schema
var Feature = new mongoose.Schema({
    feature: String,
    isSelected: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Feature', Feature);
