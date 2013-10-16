'use strict';
app.controller('playRoomController', function NormalModeController($scope, $http, $filter) {

	var gamePlay,
		canvas, canvas2;

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
	$scope.allAmount = 20;
	$scope.index = 0;
	$scope.indexChat = 0;
	$scope.gameInterval = null;

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

		//if you create this game then you host and youre index is [0]
		$scope.index = 0;

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
		for (var i = 0, len = $scope.allAmount; i < len; i++) {
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

		//add additional atribute to object
		rect.toObject = (function(toObject) {
			return function() {
				return fabric.util.object.extend(toObject.call(this), {
					newAttribute: this.newAttribute,
					_id: this._id,
					isNew: this.isNew,
					isCrashed: this.isCrashed,
				});
			};
		})(rect.toObject);

		rect.isNew = true;
		rect.playMode = true;
		rect.isCrashed = false;
		rect._id = 'client_' + gamePlay.getNewUnitId();

		rect.newAttribute = $.extend({}, gamePlay.getClientCtrl());

		fabric.util.loadImage('./img/warTank1_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0,
				offsetY: ofst
			});
			objCollection.clients.push({
				_id: gamePlay.getId(),
				'clientName': name,
				bot: rect,
				blt: null
			});
		});

		//canvas.add(rect);

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

		//add additional atribute to object
		rect.toObject = (function(toObject) {
			return function() {
				return fabric.util.object.extend(toObject.call(this), {
					newAttribute: this.newAttribute,
					_id: this._id,
					isNew: this.isNew,
					isCrashed: this.isCrashed
				});
			};
		})(rect.toObject);

		rect.isNew = true;
		rect.playMode = false;
		rect.isCrashed = false;
		rect._id = 'bot_' + gamePlay.getNewUnitId();

		rect.newAttribute = $.extend({}, gamePlay.getBotCtrl());



		fabric.util.loadImage('./img/warTank2_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0
			});
			objCollection.bots.push({
				_id: gamePlay.getId(),
				'clientName': name,
				bot: rect,
				blt: null
			});
		});

		//canvas.add(rect);

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
		canvas2 = gamePlay.getCanvas2();


		//Asign data to game constructor
		gamePlay.setCollection(objCollection);

		$scope.startGame();

		//check if all objects loaded and go next or err
		gamePlay.gameLoader(function(initData) {

			connection.send(JSON.stringify({
				type: 'initGame',
				data: initData
			}));

			//gamePlay.resetNewObjects();
			canvas.renderAll();

			setTimeout(function() {
				$scope.start();
			}, 2000);

		});


	};

	function initRemoteClient(data, botsData, index) {
		gamePlay = new Game($scope);
		canvas = gamePlay.getCanvas();
		canvas2 = gamePlay.getCanvas2();


		//Asign data to game constructor
		gamePlay.setCollection(objCollection);

		objCollection.clients.push(data);

		botsData.objects.forEach(function(value) {

			if (value.isNew) {
				gamePlay.addThisUnit(value);
			}
		});
	};

	function updateClient(data, bltData, botsData) {

		var defaultParamsForClient = {
			left: null,
			top: null,
			angle: null,
			newAttribute: {
				isMoving: null,
				isShoot: null,
				angle: null,
			}
		};

		var defaultParams = {
			newAttribute: {
				isMoving: null,
				isShoot: null,
				angle: null
			}
		};

		botsData.objects.forEach(function(value) {
			if (value.isNew) {
				gamePlay.addThisUnit(value);
			} else if (value.isCrashed) {
				gamePlay.removeThisUnit(value);
			} else {
				gamePlay.updateThisUnit(defaultParamsForClient, value);
			};
		});

		var newUnitPos = gamePlay.extendReqiredKeys(defaultParams, objCollection.clients[0].bot);

		//send info about client behavior
		connection.send(JSON.stringify({
			type: 'clientSend',
			data: newUnitPos
		}));

		if (objCollection.clients[0].bot.newAttribute.isShoot) {
			objCollection.clients[0].bot.newAttribute.isShoot = false;
		};



		canvas2.clear();
		canvas2.loadFromJSON(JSON.stringify(bltData));
		canvas2.renderAll();

		canvas.renderAll();

	};

	function updateData(data, index) {

		if (!data.newAttribute.isShoot && objCollection.clients[index].blt !== null) {
			data.newAttribute.isShoot = true;
		};

		$.extend(true, objCollection.clients[index].bot, data);


	};


	//Initialize game
	$scope.start = function() {

		$scope.gameInterval = setInterval(function() {
			gamePlay.update();

			connection.send(JSON.stringify({
				type: 'sendHost',
				data: objCollection.clients,
				blt: canvas2,
				bots: canvas,
			}));

			gamePlay.resetNewObjects();

			canvas.renderAll();
			canvas2.renderAll();

		}, 30);
	};
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

			updateClient(json.data, json.blt, json.bots);

		} else if (json.type == 'initGame') {

			initRemoteClient(json.data, json.bots);
		} else if (json.type === 'clientSend') {

			updateData(json.data, json.index);
		};

		//canvas.renderAll();
	};

});