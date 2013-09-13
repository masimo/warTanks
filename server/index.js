var express = require('express');
var fs = require('fs');

var API_TEST_MODE = '/testMode';
var API_NORMAL = '/normalMode';
var API_LARGE = '/largeMode';


var data = require('./data').storage;

exports.start = function(PORT, STATIC_DIR) {
	var app = express();

	// parse body into req.body
	app.use(express.bodyParser());

	app.use(express.compress());

	// serve static files for demo client
	app.use(express.static(STATIC_DIR));


	app.get(API_TEST_MODE, function(req, res, next) {
		data.largeData(function(items) {
			res.send(201, items);
		})

	});

	app.post(API_NORMAL, function(req, res, next) {
		data.normalData(function(items) {
			res.send(items);
		})

	});


	app.post(API_LARGE, function(req, res, next) {
		data.largeData(function(items) {
			res.send(items);
		})

	});

	/*	app.post('/search', function(req, res) {
		search_form = req.body; // <-- search items
		MySearch.doSearch(search_form, function(err, items) {
			res.send(items);
		});
	});
*/


	app.listen(process.env.PORT || 3000);

};