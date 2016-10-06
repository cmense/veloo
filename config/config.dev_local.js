var Config = {};
Config.db = {
    user:'admin',
    pass:'chill'
};
Config.app={};
Config.auth = {};

Config.db.host = 'ds035046.mlab.com:35046';
Config.db.name = 'veloo';

// Use environment defined port or 3000
Config.app.port = process.env.PORT || 3000;

Config.auth.jwtSecret = "very secret secret";

module.exports = Config;
