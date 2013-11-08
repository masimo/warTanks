// websocket and http servers
var WebSocketServer = require('ws').Server,
	http = require('http'),
	express = require('express'),
	app = express(),
	port = process.env.PORT || 5000;



var STATIC_DIR = __dirname + '/../app';

var DataActions = require('./dataActions').DataActions;

var gameData = {
	hostCollection: [],
	clients: []
};

var gameActions = new DataActions();

gameActions.gameData = gameData;

app.use(express.static(STATIC_DIR));

/*
 * Start Web-socket actions
 */
var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wsServer = new WebSocketServer({
	server: server
});

wsServer.on('connection', function(ws) {
	
	//console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	//var ws = request.accept(null, request.origin);

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
		'score': 'playerScore'
	};

	var onSocketMessage = {

		setName: function(data) {
			var hostList = [];

			userName = data.nickName;

			//send available host
			ws.send(JSON.stringify({
				type: 'hostArray',
				data: {
					hosts: gameActions.hostArray()
				}
			}));
		},
		createHost: function(data) {
			var host = [];

			//Create host
			index.host = gameData.hostCollection.push(data.newHost) - 1;
			index.client = gameData.hostCollection[index.host].clients.push(ws) - 1;

			//set unique identifier
			gameActions.getId(function(_id) {
				gameData.hostCollection[index.host].id = _id;
			});

			//gameData.hostCollection[index.host].hostIndex = index.host;

			ws.send(JSON.stringify({
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
				value.send(host);
			});
		},
		joinToHost: function(data) {

			//Create host
			var loined = false;

			gameData.hostCollection.forEach(function(value, key) {
				if (data.id === value.id &&
					data.secure === value.secure && !value.disabled) {

					index.client = value.clients.push(ws) - 1;

					userName = data.myNickName;

					index.host = gameData.hostCollection.indexOf(value);

					ws.send(JSON.stringify({
						type: 'clientConnected'
					}));

					loined = true;
				};
			});

			//if somthing go wrong
			if (!loined) {
				ws.send(JSON.stringify({
					type: 'warning',
					data: {
						message: 'Password incorrect or host not response',
						hosts: gameActions.hostArray()
					}
				}))
			};
		},
		gameChatMsg: function(data) {
			gameData.hostCollection[index.host].clients.forEach(function(value) {
				value.send(JSON.stringify({
					type: 'gameChatMsg',
					data: {
						message: data.message
					}
				}))
			});
		},
		sendHost: function(data) {

			for (var i = 1; i < gameData.hostCollection[index.host].clients.length; i++) {

				gameData.hostCollection[index.host].clients[i].send(JSON.stringify({
					type: 'sendHost',
					data: {
						updates: data.updates,
						blt: data.blt
					}
				}));
			};
		},
		clientSend: function(data) {
			if (!gameData.hostCollection[index.host]) {
				index.host = null;
				index.client = null;
				return false;
			};
			gameData.hostCollection[index.host].clients[0].send(JSON.stringify({
				type: 'clientSend',
				data: {
					updates: data.updates,
					index: index.client
				}
			}));
		},
		initGame: function(data) {

			gameData.hostCollection[index.host].disabled = true;

			for (var i = 1; i < gameData.hostCollection[index.host].clients.length; i++) {

				gameData.hostCollection[index.host].clients[i].send(JSON.stringify({
					type: 'initGame',
					data: {
						updates: data.initData,
						index: i
					}
				}));
			};

			var host = JSON.stringify({
				type: 'hostArray',
				data: {
					hosts: gameActions.hostArray()
				}
			});

			gameData.clients.forEach(function(value) {
				value.send(host);
			});
		},
		getAvalibleClients: function(data) {
			var clintCountJson = {
				type: 'getAvalibleClients',
				data: {
					count: gameActions.clientsCount(data.hostId)
				}
			}

			ws.send(JSON.stringify(clintCountJson))
		},
		playerScore: function(data) {

			gameData.hostCollection[index.host].clients.forEach(function(value, key) {
				value.send(JSON.stringify({
					type: 'score',
					data: {
						botsCount: data.botsCount
					}
				}));
			});
		}

	};

	var onCloseConnect = {
		hostLeftGame: function() {

			gameData.hostCollection[index.host].clients.forEach(function(value, key) {
				value.send(JSON.stringify({
					type: 'hostLeftGame',
					data: {
						name: userName
					}
				}));
			});

			gameData.hostCollection[index.host] = null;

			var BreakException = {};

			try {
				gameData.hostCollection.forEach(function(value, index) {

					if (value !== null) throw BreakException;
					gameData.hostCollection.splice(index, 1);
				});
			} catch (e) {
				if (e !== BreakException) throw e;
			}
		}
	}

	var userName = '';

	var index = {
		chat: null,
		host: null,
		client: null
	};

	// we need to know client index to remove them on 'close' event
	index.chat = gameData.clients.push(ws) - 1;

	ws.send(JSON.stringify({
		type: 'setName'
	}));



	/* 
	 *	User sent some message
	 */
	ws.on('message', function(message) {

		try {
			json = JSON.parse(message);
		} catch (err) {
			console.log('Bad json')
		}

		/* All massages that we receive need to check 
		 *  if we can ran it
		 */
		if (json.type in listObjects) {
			onSocketMessage[listObjects[json.type]](json.data || null);
		};
	});

	// User disconnected
	ws.on('close', function(ws) {

		// remove user from the list of connected clients
		gameData.clients.splice(index.chat, 1);

		if (index.client !== null && !gameData.hostCollection[index.host]) {
			gameData.hostCollection[index.host].clients.splice(index.client, 1);

			if (index.client === 0) {
				onCloseConnect.hostLeftGame();
			}
		};

		var host = JSON.stringify({
			type: 'hostArray',
			data: {
				hosts: gameActions.hostArray()
			}
		});

		gameData.clients.forEach(function(value) {
			value.send(host);
		});

		//Update client Index
		gameData.clients.forEach(function(value, key) {
			value.send(JSON.stringify({
				type: 'setIndex',
				data: {
					index: key
				}
			}));
		});

		console.log(new Date() + userName + " disconnected!");
	});

});