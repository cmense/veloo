module.exports = ratingRoutes;

function ratingRoutes(passport) {

    var ratingController = require('./ratingController');
    var router = require('express').Router();
    var unless = require('express-unless');

    var mw = passport.authenticate('jwt', {session: false});
    mw.unless = unless;

    router.use(mw);

    router.route('/rating')
        .post(ratingController.postRating);

    return router;
}
