// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

var express = require('express');
var fs = require('fs');

var SOCKET_PORT = 1337;

var DataActions = require('./dataActions').DataActions;

var HOSTS = '/getHost',
	JOIN_TO_THIS_HOST = '/joinToHost',
	CREATE_NEW_HOST = '/createNewHost';

var gameData = {
	hostCollection: [],
	clients: []
};

var gameActions = new DataActions();

gameActions.gameData = gameData;


exports.start = function(PORT, STATIC_DIR) {

	var app = express();


	app.use(express.bodyParser());

	app.use(express.compress());

	app.use(express.static(STATIC_DIR));

	app.listen(process.env.PORT || 3000);

}


/*
 * Start Web-socket actions
 */
var server = http.createServer(function(request, response) {});

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
	index.chat = gameData.clients.push(connection) - 1;

	connection.sendUTF(JSON.stringify({
		type: 'setName'
	}));


	// user sent some message
	connection.on('message', function(message) {


		if (message.type !== 'utf8') return false;

		try {
			json = JSON.parse(message.utf8Data);
		} catch (err) {
			console.log('Bad json')
		}


		if (json.type == 'setName') {
			var hostList = [];

			userName = json.nickName;
			hostList = gameActions.hostArray();

			//send available host
			connection.sendUTF(JSON.stringify({
				type: 'hostArray',
				data: hostList
			}));

		} else if (json.type == 'createHost') {

			var host = [];

			//Create host
			index.host = gameData.hostCollection.push(json.data) - 1;
			index.client = gameData.hostCollection[index.host].clients.push(connection) - 1;

			//set unique identifier
			gameActions.getId(function(_id) {
				gameData.hostCollection[index.host].id = _id;

			});

			//gameData.hostCollection[index.host].hostIndex = index.host;

			connection.sendUTF(JSON.stringify({
				type: 'createHost',
				data: {
					hostId: gameData.hostCollection[index.host].id,
					hostOwner: gameData.hostCollection[index.host].name
				}
			}));


			host = JSON.stringify({
				type: 'hostArray',
				data: gameActions.hostArray()
			});

			gameData.clients.forEach(function(value) {
				value.sendUTF(host);
			});


		} else if (json.type == 'joinToHost') {

			//Create host

			var loined = false;

			gameData.hostCollection.forEach(function(value, key) {



				if (json.id === value.id &&
					json.secure === value.secure && !value.disabled) {

					index.client = value.clients.push(connection) - 1;

					userName = json.myNickName;

					index.host = gameData.hostCollection.indexOf(value);

					connection.sendUTF(JSON.stringify({
						type: 'clientConnected'
					}));

					loined = true;

				};



			});

			//if somthing go wrong
			if (!loined) {
				connection.sendUTF(JSON.stringify({
					type: 'warning',
					data: 'Password incorrect or host not response',
					hosts: gameActions.hostArray()
				}))
			};



		} else if (json.type == 'gameChatMsg') {

			gameData.hostCollection[index.host].clients.forEach(function(value) {
				value.sendUTF(JSON.stringify({
					type: 'gameChatMsg',
					data: json.data
				}))
			});

		} else if (json.type == 'sendHost') {

			for (var i = 1; i < gameData.hostCollection[index.host].clients.length; i++) {

				gameData.hostCollection[index.host].clients[i].sendUTF(JSON.stringify({
					type: 'sendHost',
					data: json.data,
					blt: json.blt
				}));
			};



		} else if (json.type == 'clientSend') {

			
			gameData.hostCollection[index.host].clients[0].sendUTF(JSON.stringify({
				type: 'clientSend',
				data: json.data,
				index: index.client
			}));



		} else if (json.type == 'initGame') {

			gameData.hostCollection[index.host].disabled = true;

			for (var i = 1; i < gameData.hostCollection[index.host].clients.length; i++) {

				gameData.hostCollection[index.host].clients[i].sendUTF(JSON.stringify({
					type: 'initGame',
					data: json.data,
					index: i
				}));
			};

			var host = JSON.stringify({
				type: 'hostArray',
				data: gameActions.hostArray()
			});

			gameData.clients.forEach(function(value) {
				value.sendUTF(host);
			});
		} else if (json.type == 'getAvalibleClients') {
			var clintCountJson = {
				type: 'getAvalibleClients',
				data: {
					count: gameActions.clientsCount(json.data.hostId)
				}
			}

			connection.sendUTF(JSON.stringify(clintCountJson))
		};
	});

	// user disconnected
	connection.on('close', function(connection) {
		//if (userName !== false && userColor !== false) {

		var timeNow = new Date();
		console.log((timeNow.getHours()) + ':' + (timeNow.getMinutes()) + ':' +
			(timeNow.getSeconds()) + ' ' + userName + " disconnected!");

		// remove user from the list of connected clients

		gameData.clients.splice(index.chat, 1);

		if (index.client !== null) {
			gameData.hostCollection[index.host].clients.splice(index.client, 1);

			index.client = null;
			//We need to disabled this host if all clients left
			var len = gameData.hostCollection[index.host].clients.length;
			console.log(len);
			if (len === 0) {
				console.log(gameData.hostCollection[index.host].name + 'disabled');
				gameData.hostCollection[index.host].disabled = true;
			}
		};



		//Update client Index
		gameData.clients.forEach(function(value, key) {
			value.sendUTF(JSON.stringify({
				type: 'setIndex',
				data: key,
			}));
		});
	});

});



var webSocket = {

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