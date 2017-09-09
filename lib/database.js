"use strict";

var sqlite3 = require('sqlite3').verbose();

var createDb = function createDb(req, cb) {
  console.log("createDb");
  req.db = new sqlite3.Database('realestatefinder.sqlite3');
  cb(null, req);
};

var closeDb = function closeDb(req, cb) {
  console.log("closeDb");
  req.db.close();
  cb(null, req);
};

module.exports = {
  createDb,
  closeDb
};
