var Config = require('./config/config');
var app = require('./app');
var BookingService = require('./models/booking/bookingService');

/**
 * Start the server
  */

app.listen(Config.app.port);
console.log('Listening on port ' + Config.app.port);

var ratingInterval = 60*1000;//24*60*1000;
setInterval(function(){
  console.log("calling Job");
  BookingService.evaluateBookings();
}, ratingInterval);
