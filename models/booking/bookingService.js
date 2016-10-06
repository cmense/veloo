var Rating = require('../rating/ratingSchema');
var Booking = require('./bookingSchema');
var Status = require('./bookingStatus');
var User = require('../user/userSchema');

exports.evaluateBookings = function() {
      console.log("evaluating bookings");
      Booking.find({$and:[{endDate:{$lte:new Date()}}, {status: {$eq:Status.Status.confirmed}}]})
      .exec(function(err, bookings) {
        console.log(bookings);
        bookings.forEach(function(b) {
          b.status = Status.Status.rateable;
          b.save(function(err, b) {
              if (err) {
                  console.log("Problem saving status for " + b.id);
              }
          });
        });
        console.log(bookings);
      });
};
