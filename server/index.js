// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var express = require('express');
var fs = require('fs');

var SOCKET_PORT = 1337;
var HOSTS = '/getHost';
var JOIN_TO_THIS_HOST = '/joinToHost';
var CREATE_NEW_HOST = '/createNewHost';


var hostCollection = [];

var index = undefined;


exports.start = function(PORT, STATIC_DIR) {

	var app = express();


	app.use(express.bodyParser());

	app.use(express.compress());

	app.use(express.static(STATIC_DIR));

	app.post(HOSTS, function(req, res, next) {

		var array = [];
		var arr = {};

		for (var i = hostCollection.length - 1; i >= 0; i--) {

			arr.id = hostCollection[i].id;
			arr.name = hostCollection[i].name;
			arr.type = hostCollection[i].type;

			array.push(arr);

			arr = {};
		};

		res.send(array);

	});

	app.post(JOIN_TO_THIS_HOST, function(req, res, next) {

		for (var i = hostCollection.length - 1; i >= 0; i--) {

			if (req.body.id === hostCollection[i].id &&
				req.body.secure === hostCollection[i].secure) {

				index = i;
				console.log(req.body);

				res.send('Jioned');
			} else {
				res.send('Crashed');
			};
		};


	});

	app.post(CREATE_NEW_HOST, function(req, res, next) {

		index = hostCollection.push(webSocket.extend({}, req.body)) - 1;

		//Set random id
		hostCollection[index].id = Math.random().toString(36).substring(2);

		console.log(hostCollection[index]);

		//thisIsHost = true;

		res.send('Created');

	});

	app.post('/hosts', function(req, res, next) {

		console.log(hostCollection);

		//var obj = JSON.stringify(hostCollection);

		res.send('done');

	});

	app.listen(process.env.PORT || 3000);

}

//Socket ---------->

var server = http.createServer(function(request, response) {
	// Not important for us. We're writing WebSocket server, not HTTP server
});

server.listen(SOCKET_PORT, function() {
	console.log((new Date()) + " Server is listening on port " + SOCKET_PORT);
});

var wsServer = new webSocketServer({
	httpServer: server
});

wsServer.on('request', function(request) {
	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	var connection = request.accept(null, request.origin);


	// we need to know client index to remove them on 'close' event
	var hostIndex = index;
	console.log(hostIndex);
	var clientIndex = hostCollection[hostIndex].clients.push(connection) - 1;
	//var thisIsHost = false;

	var timeNow = new Date();

	console.log((timeNow.getHours()) + ':' + (timeNow.getMinutes()) + ':' +
		(timeNow.getSeconds()) + ' Client ' + clientIndex);


	// user sent some message
	connection.on('message', function(message) {

		console.log(message);

		if (message.type !== 'utf8') return false;

		try {
			messageNew = JSON.parse(message.utf8Data);
		} catch (err) {
			console.log('Bad obj')
		}

	});

	// user disconnected
	connection.on('close', function(connection) {
		//if (userName !== false && userColor !== false) {
		console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
		// remove user from the list of connected clients

		try {

			hostCollection[hostIndex].clients.splice(clientIndex, 1);

			console.log(hostCollection[hostIndex].clients.length);

			if (hostCollection[hostIndex].clients.length - 1 < 0) {
				hostCollection.splice(hostIndex, 1);
			};

		} catch (err) {
			console.log('Host left this connection');
		}



	});

});


var webSocket = {
	createHost: function() {



	},

	generateClient: function() {

	},
	extend: function(destination, source, clene) {

		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		if (clene) {
			return this.extend({}, destination);
		} else {
			return destination;
		};


	}
};