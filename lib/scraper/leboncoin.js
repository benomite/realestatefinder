'use strict';


var async = require('async');
var request = require('supertest');
var url = require('url');
var cheerio = require('cheerio');

var endpoints = [
  url.parse('https://www.leboncoin.fr/ventes_immobilieres/offres/rhone_alpes/rhone/?th=1&location=Chessy%2069380%2CLe%20Breuil%2069620%2CL%E9gny%2069620'),
];


var getAdPages = function getAdPages(body, cb) {
  var $ = cheerio.load(body);
  var linkTags = $('#listingAds ul > li > a.list_item');
  var links = [];

  for(let i = 0; i < linkTags.length; i += 1) {
    let linkTag = linkTags[i];
    links.push(linkTag.attribs.href);
  }

  cb(null, links);
};


var getLastAds = function getLastAds(req, cb) {
  if(!req.ads) {
    req.ads = [];
  }

  async.eachSeries(endpoints, function(endpoint, cb) {
    async.waterfall([
      function (cb) {
        console.log('------------ STARTING HTML SCRAP FOR ' + endpoint.href + ' ------------');
        request(endpoint.protocol + '//' + endpoint.hostname)
          .get(endpoint.pathname)
          .set({'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/40.0.2214.115 Safari/537.36'})
          .end(cb);
      },
      function (response, cb) {
        console.log('getAllAds');
        getAdPages(response.text, cb);
      },
      function (result, cb) {
        console.log('writeInfo');
        req.ads = req.ads.concat('https'+result);
        cb();
      }
    ], cb);
  }, function(err) {
    if(err) {
      console.log('A page failed to process');
      return cb(err);
    }
    cb(null, req);
  });
};

var scrapAd = function scrapAd(body, cb) {
  var $ = cheerio.load(body);
  var linkTags = $('#listingAds ul > li > a.list_item');
  var links = [];

  for(let i = 0; i < linkTags.length; i += 1) {
    let linkTag = linkTags[i];
    links.push(linkTag.attribs.href);
  }

  cb(null, links);
};

var scrap = function scrap(req, cb) {

  async.eachSeries(req.ads, function(adUrl, cb) {
    async.waterfall([
      function(cb) {
        var endpoint = url.parse(adUrl);
        request(endpoint.protocol + '//' + endpoint.hostname)
          .get(endpoint.pathname)
          .set({'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/40.0.2214.115 Safari/537.36'})
          .end(cb);
      },
      function(response, cb) {
        console.log('getAllAds');
        scrapAd(response.text, cb);
      },
    ], cb);
  }, function(err) {
    if(err) {
      console.log('A page failed to process');
      return cb(err);
    }
    cb(null, req);
  });
};

module.exports = {
  getLastAds,
  scrap,
};
