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

var hostIndex = null,
	clientIndex = null;

// list of currently connected clients (users)
var hostDefault = {
	type: undefined,
	name: 'default option1',
	clients: []
};


exports.start = function(PORT, STATIC_DIR) {

	var app = express();


	app.use(express.bodyParser());

	app.use(express.compress());

	app.use(express.static(STATIC_DIR));

	app.post(HOSTS, function(req, res, next) {

		var array = [];

		for (var i = hostCollection.length - 1; i >= 0; i--) {
			array.push(hostCollection[i].name);
		};

		res.send(array);

	});

	app.post(JOIN_TO_THIS_HOST, function(req, res, next) {

		for (var i = hostCollection.length - 1; i >= 0; i--) {
			if (req.body[0] === hostCollection[i].name) {

			};
		};
		console.log(req.body[0]);
		res.send('ping');
	});

	app.post(CREATE_NEW_HOST, function(req, res, next) {
		var hostIndex = hostCollection.push(webSocket.extend({}, hostDefault)) - 1;
		console.log(hostIndex);
		webSocket.createHost();
		res.send('ping');
	});

	app.listen(process.env.PORT || 3000);

}

//Socket ---------->


var webSocket = {
	createHost: function() {

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
			clientIndex = hostCollection[hostIndex].clients.push(connection) - 1;


			var timeNow = new Date();
			console.log((timeNow.getHours()) + ':' + (timeNow.getMinutes()) + ':' +
				(timeNow.getSeconds()) + ' User index ' + index);



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
				hostCollection[hostIndex].clients.splice(clientIndex, 1);

			

			});

		});

	},

	generateClient: function() {

	},
	extend: function(destination, source) {

		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;

	}
};