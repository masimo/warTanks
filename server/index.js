// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

var express = require('express');
var fs = require('fs');

var dataActions = require('./dataActions').dataActions;

var SOCKET_PORT = 1337;

var HOSTS = '/getHost',
	JOIN_TO_THIS_HOST = '/joinToHost',
	CREATE_NEW_HOST = '/createNewHost';


var hostCollection = [];
var clients = [];


exports.start = function(PORT, STATIC_DIR) {

	var app = express();


	app.use(express.bodyParser());

	app.use(express.compress());

	app.use(express.static(STATIC_DIR));

	app.post(HOSTS, function(req, res, next) {



	});

	app.post(JOIN_TO_THIS_HOST, function(req, res, next) {

		hostCollection.forEach(function(value, key) {

			if (req.body.id === value.id &&
				req.body.secure === value.secure) {

				value.clients.push({
					nickName: req.body.nickName,
					'connection': {},
					hostIndex: key
				});

				res.send('Jioned');
			} else {
				res.send('Crashed');
			};
		})
	});

	app.post(CREATE_NEW_HOST, function(req, res, next) {

		var index = hostCollection.push(webSocket.extend({}, req.body)) - 1;

		(function() {

			var _id = Math.random().toString(36).substring(2);

			for (var i = 0, len = hostCollection.length; i < len; i++) {
				if (_id == hostCollection[index].id) {
					arguments.callee();
				};
			};
			hostCollection[index].id = _id;

		})();

		//Set random id
		//hostCollection[index].id = Math.random().toString(36).substring(2);


		console.log(hostCollection[index]);

		//thisIsHost = true;
		res.send('Created');
	});

	app.post('/hosts', function(req, res, next) { //delete this

		console.log(hostCollection);

		//var obj = JSON.stringify(hostCollection);
		res.send('done');
	});

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

	var connection = request.accept(null, request.origin);

	var userName = '';

	var index = {
		chat: null,
		host: null,
		client: null
	};

	// we need to know client index to remove them on 'close' event
	index.chat = clients.push(connection) - 1;

	connection.sendUTF(JSON.stringify({
		type: 'index',
		data: index.chat
	}));

	console.log(index.chat);



	// user sent some message
	connection.on('message', function(message) {


		if (message.type !== 'utf8') return false;

		try {
			json = JSON.parse(message.utf8Data);
		} catch (err) {
			console.log('Bad json')
		}

		if (json.type == 'setName') {

			userName = json.nickName;
			var timeNow = new Date();
			console.log((timeNow.getHours()) + ':' + (timeNow.getMinutes()) + ':' +
				(timeNow.getSeconds()) + ' Client ' + userName + ' connected!');

			//send available host
			connection.sendUTF(JSON.stringify({
				type: 'hostArray',
				data: dataActions.hostArray(hostCollection)
			}));
		} else if (json.type == 'createHost') {



			//Create host
			var hostInit = hostCollection.push(json.data) - 1;

			//set unique identifier
			dataActions.getId(function(_id) {

				hostCollection[hostInit].id = _id;
			}, hostCollection);

			hostCollection[hostInit].hostIndex = hostInit;
			index.host = hostInit;

			index.client = hostCollection[hostInit].clients.push(connection) - 1;

			var host = JSON.stringify({
				type: 'hostArray',
				data: dataActions.hostArray(hostCollection)
			});
			clients.forEach(function(value) {
				value.sendUTF(host);
			});



		} else if (json.type == 'joinToHost') {

			//console.log(index.chat);

			//Create host



			hostCollection.forEach(function(value, key) {

				if (json.id === value.id &&
					json.secure === value.secure && !value.disabled) {

					index.client = value.clients.push(connection) - 1;

					index.host = value.hostIndex;

					connection.sendUTF(JSON.stringify({
						type: 'clientConnected'
					}));

				} else {

					connection.sendUTF(JSON.stringify({
						type: 'warning',
						data: 'Password incorrect or host not response',
						hosts: dataActions.hostArray(hostCollection)
					}))
				}
			});



		} else if (json.type == 'gameChatMsg') {

			hostCollection[index.host].clients.forEach(function(value) {
				value.sendUTF(JSON.stringify({
					type: 'gameChatMsg',
					data: json.data
				}))
			});

		} else if (json.type == 'sendHost') {

			hostCollection[index.host].objCollection = json.data;

			for (var i = 1; i < hostCollection[index.host].clients.length; i++) {

				hostCollection[index.host].clients[i].sendUTF(JSON.stringify({
					type: 'updateClient'
				}));
			};

		} else if (json.type == 'sendClient') {

			hostCollection[index.host].objCollection.clients[index.client] = json.data;

			hostCollection[index.host].clients.forEach(function(value) {
				value.sendUTF(JSON.stringify({
					type: 'renderAll',
					data: hostCollection[index.host].objCollection
				}));
			});
		} else if (json.type == 'initGame') {

			for (var i = 1; i < hostCollection[index.host].clients.length; i++) {

				hostCollection[index.host].clients[i].sendUTF(JSON.stringify({
					type: 'initGame',
					data: json.data

				}));
			};
		};

	});

	// user disconnected
	connection.on('close', function(connection) {
		//if (userName !== false && userColor !== false) {

		var timeNow = new Date();
		console.log((timeNow.getHours()) + ':' + (timeNow.getMinutes()) + ':' +
			(timeNow.getSeconds()) + ' ' + userName + " disconnected!");

		// remove user from the list of connected clients

		clients.splice(index.chat, 1);

		if (index.client !== null) {
			hostCollection[index.host].clients.splice(index.client, 1);

			//We need to disabled this host if all clients left
			var len = hostCollection[index.host].clients.length;
			console.log(len);
			if (len === 0) {
				hostCollection[index.host].disabled = true;
			}
		};



		//Update client Index
		clients.forEach(function(value, key) {
			value.sendUTF(JSON.stringify({
				type: 'setIndex',
				data: key,
			}));
		});
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