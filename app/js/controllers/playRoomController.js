app.controller('playRoomController', function NormalModeController($scope, $http, $filter) {

	'use strict';

	var gamePlay,
		canvas, canvas2;

	var objCollection = [];

	var dateNow = new Date().getTime(); // remove this

	//Arrays of random data
	var rdData = {
		randomAngle: [0, 90, 180, 270],
		startPosition: [24, 282, 575],
		names: ['Boris', 'Den', 'Lyolik', 'Bolik'],
		leftPosition: [200, 400]
	}

	$scope.chatHistory = '';
	$scope.gameChatMsg = '';
	$scope.startGameBtn = false;
	$scope.hostId = '';
	$scope.score = 0;
	$scope.botCounter = 20;
	$scope.allAmount = 20;
	$scope.index = 0;
	$scope.gameInterval = null;

	// Dialogs
	$scope.modalDlg = false;
	$scope.createHostDlg = false;

	$scope.hostArray = [];


	$scope.hostCreate = function() {

		//check password
		var pass = $scope.inputProtectCode || null;

		var hostData = {
			type: 'createHost',
			data: {
				id: null,
				secureType: pass !== null ? 'protected' : null, // protected or null
				name: $scope.nickName,
				hostName: $scope.inputNameGame,
				secure: pass,
				objCollection: {},
				clients: [],
				disabled: false
			}
		}

		//send data about new host
		connection.send(JSON.stringify(hostData));

		//if you create this game then you host and your index is [0]

		$scope.gameMode = true;
		$scope.createHostDlg = false;
		$scope.modalDlg = false;
		$scope.gameChat = true;
		$scope.startGameBtn = true;
	};



	$scope.joinToHost = function(data) {

		var password = null;

		_($scope.hostArray).map(function(value) {

			if (value.id == data) {

				if (value.secureType === 'protected') {
					password = prompt('This host protected');
				};

				$.extend(true, value, {
					type: 'joinToHost',
					myNickName: $scope.nickName,
					secure: password !== null ? password : null,
				});

				connection.send(JSON.stringify(value));
			};

		});
	};


	$scope.startGame = function() {


		//check if all objects loaded and go next or err
		gamePlay.gameLoader(function(initData) {

			connection.send(JSON.stringify({
				type: 'initGame',
				data: initData
			}));

			console.log(initData);

			//add object to hosts canvas
			gamePlay.everyUnit(function(unit) {

				if (unit.isNew) {
					canvas.add(unit);
					unit.isNew = false;
				}
			});

			canvas.renderAll();

			setTimeout(function() {
				$scope.playGame();
			}, 2000);

		});
	}

	//Create game with bots
	$scope.initGame = function() {
		gamePlay = new Game($scope);
		canvas = gamePlay.getCanvas();
		canvas2 = gamePlay.getCanvas2();


		//Assign data to game constructor
		gamePlay.setCollection(objCollection);


		var getClients = {
			type: 'getAvalibleClients',
			data: {
				hostId: $scope.hostId
			}
		}

		connection.send(JSON.stringify(getClients));
	};

	function initRemoteClient(data, index) {
		gamePlay = new Game($scope);
		canvas = gamePlay.getCanvas();
		canvas2 = gamePlay.getCanvas2();

		//get data from host and asign it to this client
		objCollection = data;

		//set index 
		$scope.index = index;
		gamePlay.setClientIndex(index);

		//Asign data to game constructor
		gamePlay.setCollection(objCollection);



		//Render all new bots
		gamePlay.everyUnit(function(unit) {
			//We need to know if the object is loaded on host
			if (typeof unit.fill !== 'object') {
				return false
				console.log('Unit not loaded "bad data"');
			};


			gamePlay.addThisUnit(unit);

		});

		canvas.renderAll();
	};

	// Initialize Clients

	function initClient() {
		var name = $scope.nickName || 'No name';
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

		//add additional attribute to object
		rect.toObject = (function(toObject) {
			return function() {
				return fabric.util.object.extend(toObject.call(this), {
					newAttribute: this.newAttribute,
					_id: this._id,
					isNew: this.isNew,
					isCrashed: this.isCrashed,
					isReady: this.isReady,
					clientName: this.clientName,
					blt: this.blt,

				});
			};
		})(rect.toObject);

		rect.clientName = name;
		rect.isNew = true;
		rect.playMode = true;
		rect.isCrashed = false;
		rect.blt = null;
		rect._id = 'client_' + gamePlay.getNewUnitId();

		rect.newAttribute = $.extend({}, gamePlay.getClientCtrl());

		fabric.util.loadImage('./img/warTank1_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0,
				offsetY: ofst
			});

			objCollection.push(rect);
		});
	};

	//Create bot

	function initBot() {
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

		//add additional attribute to object
		rect.toObject = (function(toObject) {
			return function() {
				return fabric.util.object.extend(toObject.call(this), {
					newAttribute: this.newAttribute,
					_id: this._id,
					isNew: this.isNew,
					isCrashed: this.isCrashed,
					isReady: this.isReady,
					clientName: this.clientName,
					blt: this.blt,
				});
			};
		})(rect.toObject);

		rect.clientName = name;
		rect.blt = null;
		rect.isNew = false;
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
			objCollection.bots.push(rect);
		});
	};



	function updateClient(data, bltData) {

		var defaultParams = {
			_id: null,
			newAttribute: {
				isMoving: null,
				isShoot: null,
				angle: null
			}
		};


		_(data).map(function(remoteUnit, remoteindex) {

			if (remoteUnit.isNew) {

				//check if this bot get in trouble
				gamePlay.addThisUnit(remoteUnit, true)
				
				return;
			};

			_(objCollection).forEach(function(unit, index) {

				if (dateNow + 2000 < new Date().getTime()) {

					console.log(data, objCollection);
					dateNow = new Date().getTime();
				};

				if (unit._id === remoteUnit._id) {

					$.extend(true, unit, remoteUnit);

					if (remoteUnit.isCrashed) {
						gamePlay.removeThisUnit(unit);
					};
				};
			});
		});

		var clientBot = objCollection[$scope.index];

		var newUnitPos = gamePlay.extendReqiredKeys(defaultParams, clientBot);

		//send info about client behavior
		connection.send(JSON.stringify({
			type: 'clientSend',
			data: newUnitPos
		}));


		if (clientBot.newAttribute.isShoot) {
			clientBot.newAttribute.isShoot = false;
		};


		canvas2.clear();
		canvas2.loadFromJSON(JSON.stringify(bltData));
		canvas2.renderAll();

		canvas.renderAll();

	};

	function updateData(data, index) {

		gamePlay.everyUnit(function(unit) {

			if (unit._id === data._id) {
				if (!data.newAttribute.isShoot && unit.blt !== null) {
					data.newAttribute.isShoot = true;
				};
				$.extend(true, unit, data);
			};
		});
	};

	//Initialize game
	$scope.playGame = function() {

		$scope.gameInterval = setInterval(function() {

			//Update units
			gamePlay.update();

			gamePlay.getAllChanges(function(changedUnit) {

				connection.send(JSON.stringify({
					type: 'sendHost',
					data: changedUnit,
					blt: canvas2,
				}));
			});

			gamePlay.checkForNewUnits();

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


		if (json.type == 'setName') {

			connection.send(JSON.stringify({
				type: 'setName',
				nickName: $scope.nickName
			}));

			//Update index when some user out
		} else if (json.type == 'setIndex') {
			console.log($scope.nickName + 'your new index is ' + json.data);
		} else if (json.type == 'hostArray') {
			$scope.hostArray = json.data;
			$scope.$apply();

		} else if (json.type === 'createHost') {
			$scope.hostId = json.data.hostId;
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
		} else if (json.type == 'sendHost') {

			updateClient(json.data, json.blt);

		} else if (json.type == 'initGame') {

			initRemoteClient(json.data, json.index);
		} else if (json.type === 'clientSend') {

			updateData(json.data, json.index);
		} else if (json.type === 'getAvalibleClients') {

			console.log(json.data.count);
			for (var i = json.data.count; i > 0; i--) {
				initClient();
			};

			$scope.startGame();

		};
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
});