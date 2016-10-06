var Rating = require('./ratingSchema');
var Booking = require('../booking/bookingSchema');
var User = require('../user/userSchema');

exports.postRating = function(req, res) {

    var rating = new Rating(req.body);

    rating.save(function(err, r) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        res.status(201).json(r);
    });
};
