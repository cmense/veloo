var Config = {};
Config.db = {
    user:'user',
    pass:'pass'
};
Config.app={};
Config.auth = {};

Config.db.host = 'host:port';
Config.db.name = 'veloo';

// Use environment defined port or 3000
Config.app.port = process.env.PORT || 3000;

Config.auth.jwtSecret = "very secret secret";

module.exports = Config;
