var Config = require('./config/config.js');

/**
 * db connect
 */

var mongoose = require('mongoose');
mongoose.connect([Config.db.host, '/', Config.db.name].join(''),{
    //eventually it's a good idea to make this secure
    user: Config.db.user,
    pass: Config.db.pass
});

/**
 * create application
 */

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan');

var app = express();

/**
 * app setup
 */

app.use(cors());
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Log requests to console
app.use(morgan('dev'));


//passport

var passport = require('passport');
var jwtConfig = require('./passport/jwtConfig');

app.use(passport.initialize());
jwtConfig(passport);


/**
 * routing
 */

var userRoutes = require("./models/user/userRoutes");
var bicycleRoutes = require("./models/bicycle/bicycleRoutes");
var pictureRoutes = require("./models/picture/pictureRoutes");
var bookingRoutes = require("./models/booking/bookingRoutes");
var ratingRoutes = require("./models/rating/ratingRoutes");
var messageRoutes = require("./models/message/messageRoutes");

app.use('/api', pictureRoutes(passport));
app.use('/api', bicycleRoutes(passport));
app.use('/api', bookingRoutes(passport));
app.use('/api', ratingRoutes(passport));
app.use('/api', messageRoutes(passport));
app.use('/', userRoutes(passport));

module.exports = app;
