var Config = {};
Config.db = {};
Config.app={};
Config.auth = {};

Config.db.host = 'mongodb:admin:chill@ds035046.mlab.com:35046';
Config.db.name = 'veloo';

// Use environment defined port or 3000
Config.app.port = process.env.PORT || 3000;

Config.auth.jwtSecret = "very secret secret";

module.exports = Config;
