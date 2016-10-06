var Config = require('../../config/config.js');
var User = require('./userSchema');
var jwt = require('jwt-simple');
var Picture = require('../picture/pictureSchema');
var Rating = require('../rating/ratingSchema');

exports.login = function (req, res) {

    if (!req.body.username) {
        res.status(400).send('username required');
        return;
    }
    if (!req.body.password) {
        res.status(400).send('password required');
        return;
    }

    User.findOne({username: req.body.username}, function (err, user) {
        if (err) {
            res.status(500).send(err);
            return
        }

        if (!user) {
            res.status(401).send('Invalid Credentials');
            return;
        }
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (!isMatch || err) {
                res.status(401).send('Invalid Credentials');
            } else {
                res.status(200).json({token: createToken(user)});
            }
        });
    });

};

exports.fbLogin = function (req, res) {

    if (!req.body.fbtoken) {
        res.status(400).send('token required');
        return;
    }

    //TODO: FB ID validation
    var user = new User();

    user.fbtoken = req.body.fbtoken;
    user.username = req.body.username;
    user.password = req.body.fbtoken;

    user.save(function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).json({token: createToken(user)});
    });
};

exports.fbAccountExists = function (req, res) {

    if (!req.body.fbtoken) {
        res.status(400).send('token required');
        return;
    }
    User.findOne({fbtoken: req.body.fbtoken}, function (err, user) {
        if(err) {
            res.status(500).send(err);
        }
        else if(!user) {
            res.status(204).send(err);
        }
        else {
            res.status(201).json({token: createToken(user)});
        }
    });
};

    


exports.signup = function (req, res) {
    if (!req.body.username) {
        res.status(400).send('username required');
        return;
    }
    if (!req.body.password) {
        res.status(400).send('password required');
        return;
    }

    var user = new User();

    user.username = req.body.username;
    user.password = req.body.password;

    user.save(function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        res.status(201).json({token: createToken(user)});
    });
};

exports.unregister = function (req, res) {
    req.user.remove().then(function (user) {
        res.sendStatus(200);
    }, function (err) {
        res.status(500).send(err);
    });
};

exports.uploadAvatar = function (req, res) {
    User.findOne(req.user, function (err, user) {
        var avatar = new Picture({data: req.body.data});
        avatar.save(function (err) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            user.avatar = avatar;
            user.save(function (err) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.sendStatus(200);
            })

        });

    })
};

exports.getUserInfo = function (req, res) {
    User.findById(req.user._id)
        .populate({
            path: 'avatar',
            select: 'data',
        })
    .exec(function(err, user) {
      if (err) {
          res.status(404).send(err);
          return;
      }
      res.json(user);
    })
};

exports.editUserInfo = function (req, res) {
    User.findByIdAndUpdate(
        req.user._id,
        req.body,
        {
            new: true,
            runValidators: true
        }, function (err, user) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(user);
        });
};

function createToken(user) {
    var tokenPayload = {
        user: {
            _id: user._id,
            username: user.username
        },
        exp: new Date().getTime() + 180 * 60 * 1000 // expiry Date 3h
    };
    return jwt.encode(tokenPayload, Config.auth.jwtSecret);
};
