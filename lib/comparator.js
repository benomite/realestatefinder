"use strict";

var async = require('async');

var compare = function compare(req, cb) {

  async.each(req.ads, function(adUrl, cb) {
    async.waterfall([
      function(cb) {
        req.db.all("SELECT id FROM page WHERE url = ?", [adUrl], cb);
      },
      function(rows, cb) {
        if(rows.length !== 0) {
          req.ads.splice(req.ads.indexOf(adUrl), 1);
        }
        cb();
      }
    ], cb);
  }, function(err) {
    if(err) {
      return cb(err);
    }
    cb(null, req);
  });
};

module.exports = {
  compare,
};
