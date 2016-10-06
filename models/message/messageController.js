var Message = require('./messageSchema');
var Booking = require('../booking/bookingSchema');

exports.postMessage = function(req, res) {
    Booking.findById(req.body.booking)
    .exec(function(err, booking){

      var sender = req.user;
      var receiver = sender.equals(booking.endUser) ? booking.provider : booking.endUser;

      req.body.sender = sender;
      req.body.receiver = receiver;

      var message = new Message(req.body);

      message.save(function(err, m) {
          if (err) {
              res.status(500).send(err);
              return;
          }
          res.status(201).json(m);
      });
    })
};

exports.getMessagesForBookingProcess = function(req, res) {
    Message.find({booking: req.params.booking_id})
    .exec(function(err, messages){
      if (err) {
          res.status(500).send(err);
          return;
      }
      res.json(messages);
    })
};
