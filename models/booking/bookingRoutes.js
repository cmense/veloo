module.exports = bookingRoutes;

function bookingRoutes(passport) {

    var bookingController = require('./bookingController');
    var router = require('express').Router();
    var unless = require('express-unless');

    var mw = passport.authenticate('jwt', {session: false});
    mw.unless = unless;

    router.use(mw);

    router.route('/booking')
        .post(bookingController.postBooking)
        .get(bookingController.getBookings);

    router.route('/booking/:booking_id')
        .get(bookingController.getBooking)
        .put(bookingController.putBooking)
        .delete(bookingController.deleteBooking);

    router.route('/booking/:booking_id/cancel')
        .post(bookingController.cancelBooking);

    router.route('/booking/:booking_id/rate')
        .post(bookingController.rateBooking);

    return router;
}
