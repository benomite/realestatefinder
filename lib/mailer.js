"use strict";

var async = require('async');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'postmaster@osterberger.fr',
    pass: '680aff1d0d0df4596b2ab6782e0d346a'
  }
});

var send = function send(req, cb) {
  async.each(req.infos, function(info, cb) {

    var content = 'Prix : <strong>' + info.price + '</strong><br/>';
    content += 'Adresse : <strong>' + info.address + '</strong><br/>';

    content += 'Images :<br/>';
    if(info.images instanceof Array) {
      info.images.forEach(function(image) {
        content += '<img src="' + image + '" width="600" style="max-width:600px;"/><br/>';
      });
    }

    var mailOptions = {
      from: '"Nono le Robot 👻" <robot@osterberger.fr>', // sender address
      to: 'benoit.osterberger+bot@gmail.com', // list of receivers
      subject: 'Nouvelle annonce !', // Subject line
      html: content
    };

    transporter.sendMail(mailOptions, cb);

  }, function(err) {
    if(err) {
      return cb(err);
    }
    cb(null, req);
  });
};

module.exports = {
  send,
};
