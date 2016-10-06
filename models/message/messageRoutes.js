module.exports = messageRoutes;

function messageRoutes(passport) {

    var messageController = require('./messageController');
    var router = require('express').Router();
    var unless = require('express-unless');

    var mw = passport.authenticate('jwt', {session: false});
    mw.unless = unless;

    router.use(mw);

    router.route('/message')
        .post(messageController.postMessage);

    router.route('/message/booking/:booking_id')
        .get(messageController.getMessagesForBookingProcess);

    return router;
}
