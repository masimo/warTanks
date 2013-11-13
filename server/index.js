// websocket and http servers
var WebSocketServer = require('websocket').server,
	http = require('http'),
	_ = require('lodash-node'),
	express = require('express'),
	app = express(),
	port = process.env.PORT || 5000;



var STATIC_DIR = __dirname + '/../app';

var DataActions = require('./dataActions').DataActions;

var gameData = {
	hostCollection: {},
	clients: []
};

var gameActions = new DataActions();

gameActions.gameData = gameData;

app.use(express.static(STATIC_DIR));

/*
 * Start Web-socket gameActions
 */
var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wsServer = new WebSocketServer({
	httpServer: server
});

wsServer.on('request', function(request) {

	//console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	var connection = request.accept(null, request.origin);

	/*Key and value can be different
	 *	Key - json.type
	 *	Value - [hendler]
	 */
	var listObjects = {
		'setName': 'setName',
		'createHost': 'createHost',
		'joinToHost': 'joinToHost',
		'gameChatMsg': 'gameChatMsg',
		'sendHost': 'sendHost',
		'clientSend': 'clientSend',
		'initGame': 'initGame',
		'getAvalibleClients': 'getAvalibleClients',
		'score': 'playerScore',
		'checkPing': 'checkPing'
	};

	var onSocketMessage = {

		setName: function(data) {
			var hostList = [];

			userName = data.nickName;

			//send available host
			connection.sendUTF(JSON.stringify({
				type: 'hostArray',
				data: {
					hosts: gameActions.hostArray()
				}
			}));
		},
		createHost: function(data) {
			var host = [];

			//get identifier of host
			index.host = gameActions.getId();

			gameData.hostCollection[index.host] = data.newHost;
			gameData.hostCollection[index.host].id = index.host;

			

			index.client = gameData.hostCollection[index.host].clients.push(connection) - 1;



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
				data: {
					hosts: gameActions.hostArray()
				}
			});

			gameData.clients.forEach(function(value) {
				value.sendUTF(host);
			});
		},
		joinToHost: function(data) {

			//Create host
			var loined = false;

			if (data.id in gameData.hostCollection) {

				var value = gameData.hostCollection[data.id];
				if (data.id === value.id &&
					data.secure === value.secure && !value.disabled) {

					index.client = value.clients.push(connection) - 1;

					userName = data.myNickName;

					index.host = value.id;

					connection.sendUTF(JSON.stringify({
						type: 'clientConnected'
					}));

					loined = true;
				}

			}

			//if somthing go wrong
			if (!loined) {
				connection.sendUTF(JSON.stringify({
					type: 'warning',
					data: {
						message: 'Password incorrect or host not response',
						hosts: gameActions.hostArray()
					}
				}));
			}
		},
		gameChatMsg: function(data) {
			gameData.hostCollection[index.host].clients.forEach(function(value) {
				value.sendUTF(JSON.stringify({
					type: 'gameChatMsg',
					data: {
						message: data.message
					}
				}));
			});
		},
		sendHost: function(data) {

			if (index.host in gameData.hostCollection) {
				for (var i = 1; i < gameData.hostCollection[index.host].clients.length; i++) {

					gameData.hostCollection[index.host].clients[i].sendUTF(JSON.stringify({
						type: 'sendHost',
						data: {
							updates: data.updates,
							blt: data.blt
						}
					}));
				}
			}
		},
		clientSend: function(data) {
			if (index.host in gameData.hostCollection) {

				gameData.hostCollection[index.host].clients[0].sendUTF(JSON.stringify({
					type: 'clientSend',
					data: {
						updates: data.updates,
						index: index.client
					}
				}));
			} else {
				index.host = null;
				index.client = null;
				return false;
			}

		},
		initGame: function(data) {

			gameData.hostCollection[index.host].disabled = true;

			for (var i = 1; i < gameData.hostCollection[index.host].clients.length; i++) {

				gameData.hostCollection[index.host].clients[i].sendUTF(JSON.stringify({
					type: 'initGame',
					data: {
						updates: data.initData,
						index: i
					}
				}));
			}

			var host = JSON.stringify({
				type: 'hostArray',
				data: {
					hosts: gameActions.hostArray()
				}
			});

			gameData.clients.forEach(function(value) {
				value.sendUTF(host);
			});
		},
		getAvalibleClients: function(data) {
			var clintCountJson = {
				type: 'getAvalibleClients',
				data: {
					count: gameActions.clientsCount(data.hostId)
				}
			};

			connection.sendUTF(JSON.stringify(clintCountJson));
		},
		playerScore: function(data) {

			gameData.hostCollection[index.host].clients.forEach(function(value, key) {
				value.sendUTF(JSON.stringify({
					type: 'score',
					data: {
						botsCount: data.botsCount
					}
				}));
			});
		},
		checkPing: function(data) {
			connection.sendUTF(JSON.stringify({
				type: 'checkPing',
				data: {
					pingStart: data.pingStart
				}
			}));
		}

	};

	var onCloseConnect = {
		hostLeftGame: function() {

			gameData.hostCollection[index.host].clients.forEach(function(value, key) {
				value.sendUTF(JSON.stringify({
					type: 'hostLeftGame',
					data: {
						name: userName
					}
				}));
			});

			//remove host from list
			delete gameData.hostCollection[index.host];

			console.log(gameData.hostCollection);
		}
	};

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



	/* 
	 *	User sent some message
	 */
	connection.on('message', function(message) {



		try {
			json = JSON.parse(message.utf8Data);
		} catch (err) {
			console.log('Bad json');
		}

		/* All massages that we receive need to check 
		 *  if we can ran it
		 */
		if (json.type in listObjects) {
			onSocketMessage[listObjects[json.type]](json.data || null);
		}
	});

	// User disconnected
	connection.on('close', function(connection) {


		// remove user from the list of connected clients
		gameData.clients.splice(index.chat, 1);

		if (index.client !== null && gameData.hostCollection[index.host] !== null) {

			// if that was host inform other players host left game
			if (index.client === 0) {
				onCloseConnect.hostLeftGame();
			}
		}

		var host = JSON.stringify({
			type: 'hostArray',
			data: {
				hosts: gameActions.hostArray()
			}
		});

		gameData.clients.forEach(function(value) {
			value.sendUTF(host);
		});

		//Update client Index
		gameData.clients.forEach(function(value, key) {
			value.sendUTF(JSON.stringify({
				type: 'setIndex',
				data: {
					index: key
				}
			}));
		});

		console.log(new Date() + userName + " disconnected!");
	});

});