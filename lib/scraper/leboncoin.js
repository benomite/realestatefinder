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
  var linkTags = $('#listingAds .mainList .tabsContent ul > li > a.list_item');
  var links = [];

  for(let i = 0; i < linkTags.length; i += 1) {
    let linkTag = linkTags[i];
    links.push('https:' + linkTag.attribs.href);
  }

  cb(null, links);
};


var getLastAds = function getLastAds(req, cb) {
  if(!req.ads) {
    req.ads = [];
  }

  async.eachSeries(endpoints, function(endpoint, cb) {
    async.waterfall([
      function(cb) {
        console.log('------------ STARTING HTML SCRAP FOR ' + endpoint.href + ' ------------');
        request(endpoint.protocol + '//' + endpoint.hostname)
          .get(endpoint.pathname)
          .set({'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/40.0.2214.115 Safari/537.36'})
          .end(cb);
      },
      function(response, cb) {
        getAdPages(response.text, cb);
      },
      function(result, cb) {
        req.ads = req.ads.concat(result);
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

  var info = {};
  var imgScript = $('#adview .adview_main > script').get()[1] ? $('#adview .adview_main > script').get()[1].children[0].data : $('#adview .adview_main > script').get()[0].children[0].data;
  var imgMatch;
  var imgRegex = /(https:\/\/img[0-9]\.leboncoin\.fr\/ad-large\/[a-z0-9]*\.jpg)/g;
  info.images = [];
  while (imgMatch = imgRegex.exec(imgScript)) {
    info.images.push(imgMatch[0]);
  }

  info.price = $('.properties h2.item_price')[0].attribs.content;
  info.address = $('.properties .line_city span.value').text().trim();

  console.log(info);
  cb(null, info);
};

var scrap = function scrap(req, cb) {
  req.infos = [];

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
        scrapAd(response.text, cb);
      },
      function(info, cb) {
        req.infos = req.infos.concat(info);
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

module.exports = {
  getLastAds,
  scrap,
};
