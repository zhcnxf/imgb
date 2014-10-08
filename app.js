var express = require('express');
var logger = require('morgan');
var request = require('request');
var cheerio = require('cheerio');
var os = require('os');

// Constants
var IMDB_LINK_PREFIX = 'http://www.imdb.com/title/tt';

var app = express();

function NotFound() {}
NotFound.prototype = new Error('Not Found');
NotFound.prototype.status = 404;

app.use(logger('dev'));

app.get('/:img', function(req, res, next) {
	var img = req.params.img;
    if (img.indexOf('tt') == 0) {
        img = img.substring(2);
    }
	if (img.indexOf('.jpg', img.length - 4) < 0) {
		return next(new NotFound);
	} else {
		try {
			var id = parseInt(img.substring(0, img.lastIndexOf('.jpg')));
		} catch (e) {
		} finally {
			if (!(typeof id === 'number') || id === NaN) {
				return next(new NotFound);
			}
		}
	}
	
	var page = IMDB_LINK_PREFIX + id;
	console.log(page);
	request(page, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			var url = (cheerio.load(body))('#title-overview-widget img').attr('src');
			if (url && url.indexOf('http') == 0) {
				console.log(url);
				request(url).pipe(res);
			} else {
				next(new NotFound);
			}
		} else {
			next(new NotFound);
		}
	});
});

module.exports = app;
