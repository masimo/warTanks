'use strict';
app.controller('playRoomController', function NormalModeController($scope, $http, $filter) {

	var gamePlay,
		canvas;

	var objCollection = {
		clients: [],
		bots: []
	};
	//Arrays of random data
	var rdData = {
		randomAngle: [0, 90, 180, 270],
		startPosition: [24, 282, 575],
		names: ['Boris', 'Den', 'Lyolik', 'Bolik'],
		leftPosition: [200, 400]
	}
	$scope.youHost = false;
	$scope.startGameBtn = true;
	$scope.chatHistory = '';
	$scope.score = 0;
	$scope.botCounter = 20;
	$scope.index = 0;
	$scope.indexChat = 0;
	$scope.client = {
		clientType: 'client'
	}
	// Dialogs
	$scope.modalDlg = false;
	$scope.createHostDlg = false;

	$scope.hostArray = [];



	//console.log(connection);
	$scope.getHostArray = function() {
		$http({
			method: 'POST',
			url: '/getHost'
		}).
		success(function(data, status, headers, config) {
			$scope.hostArray = data;
		}).
		error(function(data, status, headers, config) {
			console.log('crashed');
		});
	};

	$scope.checkList = function() {

		$http({
			method: 'POST',
			url: '/hosts'
		}).
		success(function(data, status, headers, config) {
			console.log(data);
		}).
		error(function(data, status, headers, config) {
			console.log('crashed');
		});

	};

	$scope.joinToHost = function(data) {

		var currentHost = {};


		for (var i = 0, len = $scope.hostArray.length; i < len; i++) {

			if ($scope.hostArray[i].id == data) {
				currentHost = $scope.hostArray[i];
				break;
			};

		};

		currentHost.secure = null;

		if (currentHost.secureType === 'protected') {
			currentHost.secure = prompt('This host protected');
		};

		currentHost.type = 'joinToHost';

		currentHost.myNickName = $scope.nickName;

		connection.send(JSON.stringify(currentHost));

	};



	$scope.hostCreate = function() {

		//check password
		var pass = $scope.inputProtectCode || null;

		connection.send(JSON.stringify({
			type: 'createHost',
			data: {
				id: null,
				hostIndex: null,
				secureType: pass !== null ? 'protected' : null, // protected or undefined
				name: $scope.inputNameGame,
				secure: pass,
				objCollection: {},
				clients: [],
				disabled: false
			}
		}));

		$scope.gameMode = true;
		$scope.createHostDlg = false;
		$scope.modalDlg = false;

		$scope.gameChat = true;



	};

	$scope.startGame = function() {

		//Initialize client
		for (var i = 0, len = 2; i < len; i++) {
			initClient();
		}

		//Bot initialization
		for (var i = 0, len = 3; i < len; i++) {
			$scope.initBot();
		};

	}
	//Init Clients

	function initClient() {
		var name = name || 'defaultName';
		var self = this;
		var pos = rdData.leftPosition.slice(0).sort(function() {
			return Math.random() > 0.5;
		}).shift();

		var ofst = pos === 200 ? 0 : -48;

		var rect = new fabric.Rect({
			left: pos,
			top: 575,
			width: 36,
			height: 48,
		});

		canvas.add(rect);

		fabric.util.loadImage('./img/warTank1_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0,
				offsetY: ofst
			});
			objCollection.clients.push({
				'clientName': name,
				bot: rect,
				blt: null,
				ctrl: gamePlay.extend({}, gamePlay.getClientCtrl())
			});
		});
	};
	//Create bot
	$scope.initBot = function() {
		var name = rdData.names.slice(0).sort(function() {
			return Math.random() > 0.5;
		}).shift();
		var pos = rdData.startPosition.slice(0).sort(function() {
			return Math.random() > 0.5;
		}).shift();
		var angle = rdData.randomAngle.slice(0).sort(function() {
			return Math.random() > 0.5;
		}).shift();
		var rect = new fabric.Rect({
			left: pos,
			top: 24,
			width: 36,
			height: 48,
			angle: angle
		});

		canvas.add(rect);


		fabric.util.loadImage('./img/warTank2_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0
			});
			objCollection.bots.push({
				'clientName': name,
				bot: rect,
				blt: null,
				ctrl: gamePlay.extend({}, gamePlay.getBotCtrl())
			});
		});
		$scope.botCounter--;
	};

	(function(window) {
		var onEachFrame;
		if (window.webkitRequestAnimationFrame) {
			onEachFrame = function(cb) {
				var _cb = function() {
					cb();
					webkitRequestAnimationFrame(_cb);
				}
				_cb();
			};
		} else if (window.mozRequestAnimationFrame) {
			onEachFrame = function(cb) {
				var _cb = function() {
					cb();
					mozRequestAnimationFrame(_cb);
				}
				_cb();
			};
		} else {
			onEachFrame = function(cb) {
				setInterval(cb, 1000 / 60);
			}
		}
		window.onEachFrame = onEachFrame;
	})(window);


	//Create game with bots
	$scope.initGame = function() {
		gamePlay = new Game($scope);
		canvas = gamePlay.getCanvas();

		//Asign data to game constructor
		gamePlay.setCollection(objCollection);

		$scope.startGame();

		setTimeout(function() {

			canvas.renderAll();

			connection.send(JSON.stringify({
				type: 'initGame',
				data: objCollection
			}));
		}, 500);

		setTimeout(function() {
			$scope.start();
		}, 2000);
	};

	function initRemoteClient(data, canvasData) {
		gamePlay = new Game($scope);
		canvas = gamePlay.getCanvas();

		//Asign data to game constructor
		gamePlay.setCollection(objCollection);

		objCollection = data;

		for (var prop in objCollection) {
			objCollection[prop].forEach(function(value) {
				canvas.add(new fabric.Rect(value.bot));
			});
		}


		//canvas.loadFromJSON(JSON.stringify(data));

		setTimeout(function() {
			canvas.renderAll()
		}, 50);


	};

	function updateClient(data, canvasData) {

		//objCollection = data;

		for (var prop in objCollection) {
			objCollection[prop].forEach(function(value, key) {

				value.bot.left = data[prop].bot[key].left;
				value.bot.top = data[prop].bot[key].top;
				value.bot.angle = data[prop].bot[key].angle;

			});
		}

		//canvas.add(new fabric.Rect(data));
		//canvas.loadFromJSON(JSON.stringify(data));

		canvas.renderAll();


		//canvas.loadFromJSON(JSON.stringify(canvasData)).renderAll();

	};

	//Initialize game
	$scope.start = function() {

		setInterval(function() {
			gamePlay.update();

			connection.send(JSON.stringify({
				type: 'sendHost',
				data: objCollection
			}));

			canvas.renderAll();

		}, 30);

		;
	}
	/*
$scope.start = function() {
window.onEachFrame(function() {
gamePlay.update();
var json = JSON.stringify(objCollection);
//console.log(json);
connection.send(json);
});
}
*/



	$scope.botCounterAdd = function() {
		//If true then add new bot
		if ($scope.botCounter > 0) {
			$scope.initBot();
			$scope.$apply();
		};
	};



	$scope.sendGameChat = function(text) {

		var message = '<b>' + $scope.nickName + '</b>' + ' ' + text;

		connection.send(JSON.stringify({
			type: 'gameChatMsg',
			data: message
		}));


	}


	$scope.showErrorMsg = function(data) {
		$scope.errorMsg = data;
		$scope.messageMode = true;

		setTimeout(function() {
			$scope.messageMode = false;
		}, 2000);

		$scope.$apply();
	};


	$('#chatGameMode').keydown(function(event) {
		var key = event.keyCode;

		if (key === 13 && $scope.gameMode && $scope.gameChatMsg) {
			var text = $(this).val();

			$scope.sendGameChat(text);

		};
	});

	$scope.nickName = prompt('Type youre nick name');
	$scope.nickName = $scope.nickName ? $scope.nickName : 'Default name';

	window.WebSocket = window.WebSocket || window.MozWebSocket;
	// if browser doesn't support WebSocket, just show some notification and exit
	if (!window.WebSocket) {
		console.log('Sory doesnt work');
		return;
	};

	// open connection
	var connection = new WebSocket('ws://127.0.0.1:1337');

	connection.onmessage = function(message) {
		try {
			var json = JSON.parse(message.data);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message.data);
			return;
		}

		if (json.type == 'index') {

			$scope.indexChat = json.data;
			connection.send(JSON.stringify({
				type: 'setName',
				nickName: $scope.nickName
			}));

			//Update index when some user out
		} else if (json.type == 'setIndex') {
			$scope.indexChat = json.data;
			console.log($scope.nickName + 'your new index is ' + $scope.indexChat);
		} else if (json.type == 'hostArray') {
			$scope.hostArray = json.data;
			$scope.$apply();
		} else if (json.type === 'youHost') {
			$scope.youHost = true;
			$scope.$apply();
		} else if (json.type == 'gameChatMsg') {

			var timeNow = new Date();
			var message = timeNow.getHours() + ':' + timeNow.getMinutes() +
				':' + timeNow.getSeconds() + ' ' + json.data;
			$scope.chatHistory = message + '<br />' + $scope.chatHistory;

			$scope.gameChatMsg = '';
			$scope.$apply();
		} else if (json.type == 'clientConnected') {

			$scope.gameMode = true;
			$scope.gameChat = true;
			$scope.$apply();

		} else if (json.type == 'warning') {

			$scope.showErrorMsg(json.data);
			$scope.hostArray = json.hosts;

			$scope.$apply();
		} else if (json.type == 'updateClient') {

			updateClient(json.data);

		} else if (json.type == 'initGame') {

			initRemoteClient(json.data);
		};

		//canvas.renderAll();
	};

});