var Picture = require('./pictureSchema');

exports.postPicture = function(req, res) {

    console.log(req.files);
    var picture = new Picture(req.body);

    picture.save(function(err, p) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        res.status(201).json(p);
    });
};

// Create endpoint /api/pictures/:picture_id for GET
exports.getPicture = function(req, res) {
    // Use the Beer model to find a specific beer
    Picture.findById(req.params.picture_id, function(err, picture) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(picture);
    });
};

// Create endpoint /api/pictures/:picture_id for DELETE
exports.deletePicture = function(req, res) {
    // Use the Beer model to find a specific beer and remove it
    Picture.findById(req.params.picture_id, function(err, p) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        //authorize
        if (p.user && req.user.equals(p.user)) {
            p.remove();
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }

    });
};
