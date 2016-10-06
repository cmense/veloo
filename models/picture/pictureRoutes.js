module.exports = pictureRoutes;

function pictureRoutes(passport) {

    var pictureController = require('./pictureController');
    var router = require('express').Router();
    var unless = require('express-unless');

    var mw = passport.authenticate('jwt', {session: false});
    mw.unless = unless;

    router.use(mw.unless({method: ['GET', 'OPTIONS']}));

    router.route('/picture')
        .post(pictureController.postPicture);

    router.route('/picture/:picture_id')
        .get(pictureController.getPicture)
        .delete(pictureController.deletePicture);

    return router;
}
