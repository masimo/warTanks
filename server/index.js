// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var express = require('express');
var fs = require('fs');

var SOCKET_PORT = 1337;


var history = [];
// list of currently connected clients (users)
var clients = [];


exports.start = function(PORT, STATIC_DIR) {

	var app = express();


	app.use(express.bodyParser());

	app.use(express.compress());


	app.use(express.static(STATIC_DIR));

	app.listen(process.env.PORT || 3000);

}

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

	// accept connection - you should check 'request.origin' to make sure that
	// client is connecting from your website
	// (http://en.wikipedia.org/wiki/Same_origin_policy)
	var connection = request.accept(null, request.origin);



	// we need to know client index to remove them on 'close' event
	var index = clients.push(connection) - 1;
	var userName = false;
	var userColor = false;

	if (index === 0) {

		var json = JSON.stringify({
			clientType: 'host'

		});

		clients[index].sendUTF(json);
	}

	console.log((new Date()) + ' Connection accepted.');

	console.log(index);


	// user sent some message
	connection.on('message', function(message) {

		//console.log(message);

		if (message.type === 'utf8') { // accept only text


			messageNew = JSON.parse(message.utf8Data);

			// log and broadcast the message
			//console.log((new Date()) + ' Received Message from ' + messageNew);

			if (index === 0) {

				var json = JSON.stringify({
					type: 'action',
					data: messageNew
				});

				// we want to keep history of all sent messages
				for (var i = 0; i < clients.length; i++) {
					clients[i].sendUTF(json);
				}
			}


		} else {

			console.log('This is not utf-8');
		}

	});

	// user disconnected
	connection.on('close', function(connection) {
		//if (userName !== false && userColor !== false) {
		console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
		// remove user from the list of connected clients
		clients.splice(index, 1);

		if (clients.length) {

			var json = JSON.stringify({
				clientType: 'host'

			});

			clients[0].sendUTF(json);
		};

		// push back user's color to be reused by another user
		//colors.push(userColor);
		//}
	});

});