var Booking = require('./bookingSchema');
var Status = require('./bookingStatus');
var Bicycle = require('../bicycle/bicycleSchema');
var Message = require('../message/messageSchema');
var User = require('../user/userSchema');
var Rating = require('../rating/ratingSchema');

exports.postBooking = function(req, res) {

    Bicycle.findById(req.body.bicycle, function(err, bicycle) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        Booking.find({
            bicycle: bicycle
        }, function(err, bookings) {
            var insert = true;
            var startDate = new Date(req.body.startDate);
            var endDate = new Date(req.body.endDate);

            bookings.forEach(function(b) {
                if ((startDate >= b.startDate && startDate <= b.endDate) ||
                    (endDate >= b.startDate && endDate <= b.endDate)) {
                    insert = false;
                }
            });

            if (!insert) {
                res.status(400).send("Time not available");
                return;
            }
            req.body.status = Status.Status.confirmed;
            req.body.provider = bicycle.owner;
            req.body.endUser = req.user._id;

            var booking = new Booking(req.body);

            booking.save(function(err, b) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.status(201).json(b);
            });
        });
    });
};

// Create endpoint /api/bookings for GET
exports.getBookings = function(req, res) {
    Booking.find({
            $or: [{
                provider: req.user
            }, {
                endUser: req.user
            }]
        })
        .populate({
            path: 'provider',
            select: 'username avatar aggregatedRating',
            populate: {
                path: 'avatar',
                select: 'data'
            }
        })
        .populate({
            path: 'endUser',
            select: 'username avatar aggregatedRating',
            populate: {
                path: 'avatar',
                select: 'data'
            }
        })
        .populate({
            path: 'bicycle',
            select: 'location',
        })
        .exec(function(err, bookings) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(bookings);
        });
};


// Create endpoint /api/bookings/:booking_id for GET
exports.getBooking = function(req, res) {
    Booking.findById(req.params.booking_id)
        .populate({
            path: 'provider',
            select: 'username avatar aggregatedRating ratings',
            populate: [{
                path: 'avatar',
                select: 'data'
            },{
                path: 'ratings',
                select: 'rater ratedUser starRating ratingText',
                match: {
                    published: true
                },
                populate: {
                    path: 'rater',
                    select: 'username'
                }
            }]
        })
        .populate({
            path: 'endUser',
            select: 'username avatar aggregatedRating ratings',
            populate: [{
                path: 'avatar',
                select: 'data'
            },{
                path: 'ratings',
                select: 'rater ratedUser starRating ratingText',
                match: {
                    published: true
                },
                populate: {
                    path: 'rater',
                    select: 'username'
                }
            }]
        })
        .populate({
            path: 'bicycle',
            select: 'price city street zipcode location'
        })
        .lean()
        .exec(function(err, booking) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            Message.find({
                booking: booking
            }, function(err, messages) {
                booking.messages = messages;
                Rating.find({
                        booking: booking
                    })
                    .exec(function(err, ratings) {
                        booking.yetRated = ratings.length == 1 && ratings[0].rater.equals(req.user._id);
                        res.json(booking);
                    });
            })
        });
};

// Create endpoint /api/bookings/:booking_id for PUT
exports.putBooking = function(req, res) {
    Booking.findByIdAndUpdate(
        req.params.booking_id,
        req.body, {
            //pass the new object to cb function
            new: true,
            //run validations
            runValidators: true
        },
        function(err, booking) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(booking);
        });
};

// Create endpoint /api/bookings/:booking_id for DELETE
exports.deleteBooking = function(req, res) {
    Booking.findById(req.params.booking_id, function(err, b) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        //authorize
        if (b.user && req.user.equals(b.user)) {
            b.remove();
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }

    });
};

exports.cancelBooking = function(req, res) {
    Booking.findById(
            req.params.booking_id)
        .exec(function(err, booking) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            if (req.user.equals(booking.provider)) {
                booking.status = Status.Status.cancelledByProvider;

            } else if (req.user.equals(booking.endUser)) {
                booking.status = Status.Status.cancelledByEndUser;
            }

            booking.save(function(err, b) {
                if (err) {
                    console.log("Problem saving status for " + b.id);
                }
                res.json(booking);
            });
        });
};

exports.rateBooking = function(req, res) {
    Booking.findById(
            req.params.booking_id)
        .exec(function(err, booking) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            if (booking.status == Status.Status.rateable) {
                Rating.find({
                        booking: booking
                    })
                    .exec(function(err, ratings) {
                        req.body.published = false;
                        req.body.rater = req.user._id;
                        req.body.ratedUser = booking.provider.equals(req.user._id) ? booking.endUser : booking.provider;
                        req.body.booking = booking;
                        console.log(req.body);
                        if (ratings.length == 1) {
                            req.body.published = true;
                            ratings[0].published = true;

                            ratings[0].save(function(err, r) {
                                if (err) {
                                    console.log("Problem saving rating " + ratings[0]._id);
                                }
                                booking.status = Status.Status.finished;
                                booking.save(function(err, b) {
                                    if (err) {
                                        console.log("Problem saving booking " + booking._id);
                                    }
                                    updateAggregatedRatingOfUser(req.body.rater, ratings[0], function() {
                                        var rating = new Rating(req.body);
                                        rating.save(function(err, r) {
                                            if (err) {
                                                res.status(500).send(err);
                                                return;
                                            }
                                            updateAggregatedRatingOfUser(req.body.ratedUser, r, function() {
                                                res.status(201).json(r);
                                            });
                                        });
                                    });
                                });
                            });
                        } else if (ratings.length > 1) {
                            res.status(500).send(err);
                            return;
                        } else {
                            var rating = new Rating(req.body);
                            rating.save(function(err, r) {
                                if (err) {
                                    res.status(500).send(err);
                                    return;
                                }
                                res.status(201).json(r);
                            });
                        }
                    });
            } else {
                res.status(500).send(err);
                return;
            }
        });
};

function updateAggregatedRatingOfUser(userId, rating, callback) {
    User.findById(userId)
        .exec(function(err, user) {
            console.log(user.ratings);
            user.ratings.push(rating);
            user.save(function(err, u) {
                if (err) {
                    console.log("Error saving user " + user._id);
                }
                Rating.find({
                    ratedUser: user
                }).exec(function(err, ratings) {
                    var sum = 0;
                    ratings.forEach(function(r) {
                        sum += r.starRating;
                    });
                    console.log(sum);
                    console.log(u.aggregatedRating);
                    console.log(u.ratings.length);
                    user.aggregatedRating = sum / user.ratings.length;
                    console.log(u.aggregatedRating);
                    user.save(function(err, u) {
                        if (err) {
                            console.log("Error saving user " + user._id);
                        }
                        console.log(u);
                        callback();
                    })
                })
            })
        });
}
