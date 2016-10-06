var Bicycle = require('./bicycleSchema');
var Picture = require('../picture/pictureSchema');
var Feature = require('../feature/featureSchema');
var Booking = require('../booking/bookingSchema');
var User = require('../user/userSchema');
var Rating = require('../rating/ratingSchema');

var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'openstreetmap'
};

var geocoder = NodeGeocoder(options);

exports.postBicycle = function(req, res) {

    var bicycle = new Bicycle(req.body);
    bicycle.owner = req.user;
    var success = true;

    User.findById(req.user._id, function(err, user) {
        user.bicycles.push(bicycle);
    });

    if (success) {
        bicycle.save(function(err, b) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            res.status(201).json(b);
        });
    }
};

// Create endpoint /api/bicycles for GET
exports.getBicycles = function(req, res) {
    Bicycle.find({
            isActive:  {
                $ne: false
            }
        })
        .populate({
            path: 'owner',
            select: 'username avatar aggregatedRating',
            populate: {
                path: 'avatar',
                select: 'data'
            }
        })
        .lean()
        .exec(function(err, bicycles) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            bicycles.forEach(function(b) {
                b.pictures = [b.pictures[0]];
            });

            res.json(bicycles);
        });
};

exports.getOwnBicycles = function(req, res) {
    console.log(req.user);
    Bicycle.find({
            owner: req.params.user_id
        })
        .populate({
            path: 'owner',
            select: 'username avatar aggregatedRating',
            populate: {
                path: 'avatar',
                select: 'data'
            }
        })
        .lean()
        .exec(function(err, bicycles) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            bicycles.forEach(function(b) {
                b.pictures = [b.pictures[0]];
            });

            res.json(bicycles);
        });
}


// Create endpoint /api/bicycles/:bicycle_id for GET
exports.getBicycle = function(req, res) {
    Bicycle.findById(req.params.bicycle_id)
        .populate({
            path: 'owner',
            select: 'username avatar aggregatedRating',
            populate: {
                path: 'avatar',
                select: 'data'
            }
        })
        .lean()
        .exec(function(err, bicycle) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            calculateAvailability(bicycle, function(restrictions) {
                bicycle.restrictions = restrictions;
                Rating.find({
                        $and: [{
                            ratedUser: bicycle.owner
                        }, {
                            published: true
                        }]
                    })
                    .exec(function(err, ratings) {
                        bicycle.ratings = ratings;
                        res.json(bicycle);
                    });
            })
        });
};

// Create endpoint /api/bicycles/:bicycle_id for PUT
exports.putBicycle = function(req, res) {
    Bicycle.findByIdAndUpdate(
        req.params.bicycle_id,
        req.body, {
            new: true,
            runValidators: true
        },
        function(err, bicycle) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            res.json(bicycle);
        });
};

// Create endpoint /api/bicycles/:bicycle_id for DELETE
exports.deleteBicycle = function(req, res) {
    Bicycle.findById(req.params.bicycle_id, function(err, bicycle) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        //authorize
        if (bicycle.user && req.user.equals(bicycle.user)) {
            bicycle.remove();
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }

    });
};

exports.searchBicycle = function(req, res) {
    req.query.page = req.query.page ? req.query.page : 0;
    req.query.limit = req.query.limit ? req.query.limit : 10;

    var coords = []; // [lng, lat]
    var maxDistance = 10000; //in m
    maxDistance /= 6371; //convert to radians

    geocoder.geocode(req.query.q, function(err, locations) {
        if (locations && locations.length > 0) {
            coords[0] = locations[0].longitude;
            coords[1] = locations[0].latitude;
        } else {
            res.status(400).send(err);
            return;
        }
        //filters: type, size, availability
        var query = Bicycle.find({
            location: {
                $near: coords,
                $maxDistance: maxDistance
            }
        });
        if (req.query.type) {
            query.where('type').eq(req.query.type);
        } else if (req.query.size) {
            query.where('size').eq(req.query.size);
        }
        query.lean()
            .populate({
                path: 'owner',
                select: 'username avatar aggregatedRating',
                populate: {
                    path: 'avatar',
                    select: 'data'
                }
            }).exec(function(err, bicycles) {
                var results = [],
                    resultsCount = 0;

                if (bicycles) {
                    for (var x = (0 + req.query.page * req.query.limit); x < Math.min(bicycles.length, (req.query.page + 1) * req.query.limit); x++) {
                        results.push(bicycles[x]);
                    }
                }

                resultsCount = results.length;
                if (resultsCount == 0) {
                    res.json({
                        results: results,
                        resultsCount: resultsCount
                    });
                    return;
                }

                var counter = 0;
                console.log(resultsCount);
                results.forEach(function(b) {
                    calculateAvailability(b, function(restrictions) {
                        b.restrictions = restrictions;
                        b.pictures = [b.pictures[0]];
                        counter++;
                        if (counter == resultsCount) {
                            res.json({
                                results: results,
                                resultsCount: resultsCount
                            });
                            return;
                        }
                    });
                });


            });
    });
};

function calculateAvailability(bicycle, callback) {
    console.log("calculating availability");
    Booking.find({
            bicycle: bicycle,
            endDate: {
                $gte: new Date()
            }
        })
        .exec(function(err, bookings) {
            var restrictions = [];
            bookings.forEach(function(b) {
                restrictions = restrictions.concat(getDates(b.startDate, b.endDate));
            });
            console.log(restrictions);
            callback(restrictions);
        });
}

function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate)
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}
