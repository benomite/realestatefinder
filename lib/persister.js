"use strict";

var async = require('async');

var saveNewAds = function saveNewAds(req, cb) {
  async.each(req.ads, function(adUrl, cb) {

    req.db.all("INSERT INTO page (url) VALUES (?)", [adUrl], cb);

  }, function(err) {
    if(err) {
      return cb(err);
    }
    cb(null, req);
  });
};

module.exports = {
  saveNewAds,
};
