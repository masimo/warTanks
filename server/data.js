var mongoose = require('mongoose');
var fs = require('fs');

var db = mongoose.connection;

//var DATA_FILE = __dirname + '/data/data_L.json';

var data = {};

db.on('error', console.error);
db.once('open', function() {

	var theObject = new mongoose.Schema({
		id: Number,
		Name: String,
		Price: Number,
		rating: Number
	});

	// Compile a 'Movie' model using the theObject as the structure.
	// Mongoose also creates a MongoDB collection called 'Movies' for these documents.



	/*fs.readFile(DATA_FILE, 'utf8', function(err, data) {

		JSON.parse(data).forEach(function(value, key) {


			if (!key) return;



			var itemsCollection = new data_large({
				id: value[0],
				Name: value[1],
				Price: value[2],
				rating: value[3]
			});

			itemsCollection.save(function(err, itemsCollection) {
				if (err) return console.error(err);
				console.dir(itemsCollection);
			});

		});
	});

*/

	/* itemsCollection.save(function(err, itemsCollection) {
if (err) return console.error(err);
console.dir(itemsCollection);
}); */

	// Find a single movie by name.
	/*	Movie.findOne({
		title: 'Thor'
	}, function(err, thor) {
		if (err) return console.error(err);
		console.dir(thor);
	});*/

	// Find all movies.

	data.normalData = function(callback) {

		var data_normal = mongoose.model('data_normal', theObject);

		data_normal.find(function(err, itemsCollection) {
			if (err) return console.error(err);
			callback(itemsCollection);

		});
	};
	data.largeData = function(callback) {

		var data_large = mongoose.model('data_large', theObject);

		data_large.find(function(err, itemsCollection) {
			if (err) return console.error(err);
			callback(itemsCollection);
		});
	};

	// Find all itemsCollection that have a credit cookie.
	/*data_normal.find({
		hasCreditCookie: true
	}, function(err, itemsCollection) {
		if (err) return console.error(err);
		console.dir(itemsCollection);
	});*/

	/*	theObject.statics.findAllWithCreditCookies = function(callback) {
		return this.find({
			hasCreditCookie: true
		}, callback);
	};

	// Use the helper as a static function of the compiled Movie model.
	Movie.findAllWithCreditCookies(function(err, itemsCollection) {
		if (err) return console.error(err);
		console.dir(itemsCollection);
	});*/
});

mongoose.connect('mongodb://localhost/user');

exports.storage = data;