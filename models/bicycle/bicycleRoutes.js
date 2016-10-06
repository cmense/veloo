module.exports = bicycleRoutes;

function bicycleRoutes(passport) {

    var bicycleController = require('./bicycleController');
    var router = require('express').Router();
    var unless = require('express-unless');

    var mw = passport.authenticate('jwt', {
        session: false
    });
    mw.unless = unless;

    router.use(mw.unless({
        method: ['GET', 'OPTIONS']
    }));

    router.route('/bicycle')
        .post(bicycleController.postBicycle)
        .get(bicycleController.getBicycles);

    router.route('/bicycle/search')
        .get(bicycleController.searchBicycle);

    router.route('/bicycle/ofuser/:user_id')
        .get(bicycleController.getOwnBicycles);


    router.route('/bicycle/:bicycle_id')
        .get(bicycleController.getBicycle)
        .put(bicycleController.putBicycle)
        .delete(bicycleController.deleteBicycle);

    return router;
}
