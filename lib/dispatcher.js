'use strict';

var async = require('async');
var leboncoin = require('./scraper/leboncoin');
var database = require('./database');
var comparator = require('./comparator');

var init = function(cb) {
  var req = {};
  cb(null, req);
};

var dispatch = function dispatch(cb) {

  async.waterfall([
    init,
    database.createDb,
    leboncoin.getLastAds,
    // seloger.getLastAds
    // compare retrieved with db
    comparator.compare,
    // scrap missing pages
    leboncoin.scrap,
    // save to db new pages
    // send mails with new pages info
    database.closeDb,
  ], function(err) {
    if(err) {
      console.error(err);
    }
    cb();
  });
};


module.exports = {
  dispatch
};