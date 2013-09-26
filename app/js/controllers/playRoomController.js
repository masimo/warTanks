'use strict';

app.controller('playRoomController', function NormalModeController($scope, $filter) {

	var gamePlay = new Game($scope);
	var canvas = gamePlay.getCanvas();

	var objCollection = {
		clients: [],
		bots: []
	}

	//Arrays of random data
	var rdData = {
		randomAngle: [0, 90, 180, 270],
		startPosition: [24, 282, 575],
		names: ['Boris', 'Den', 'Lyolik', 'Bolik']
	}

	$scope.score = 0;
	$scope.botCounter = 20;

	$scope.index = index;

	$scope.client = {
		clientType: 'client'
	}

	window.WebSocket = window.WebSocket || window.MozWebSocket;

	// if browser doesn't support WebSocket, just show some notification and exit
	if (!window.WebSocket) {
		console.log('Sory doesnt work');
		return;
	};

	// open connection
	var connection = new WebSocket('ws://127.0.0.1:1337');

	//console.log(connection);

	//Asign data to game constructor
	gamePlay.setCollection(objCollection);


	$scope.hostCreate = function() {

		//Initialize client
		initClient();

		//Bot initialization
		for (var i = 0, len = 3; i < len; i++) {

			$scope.initBot();
		};
	};

	//Init Clients

	function initClient() {
		var name = name || 'defaultName';
		var self = this;

		var rect = new fabric.Rect({
			left: 200,
			top: 575,
			width: 36,
			height: 48,
		});

		canvas.add(rect);

		fabric.util.loadImage('./img/warTank1_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0
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

	//Initialize game



	$scope.start = function() {

		setInterval(function() {

			gamePlay.update();

			var json = JSON.stringify(objCollection);

			//console.log(json);

			connection.send(json);



		}, 1000);
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

	var getConnection = function(){


	};


	connection.onmessage = function(message) {


		try {
			var json = JSON.parse(message.data);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message.data);
			return;
		}


		if (json.clientType === 'host') {

			$scope.client.clientType = 'host';

			$scope.$apply();


		} else if (json.type === 'action') { // it's a single message


			console.log(json);

			objCollection = json.data;

		} else if (json.type === 'client') { // it's a single message

			console.log(json.data);

			//objCollection.clients = json.data;

		} else {

			console.log('Hmm..., I\'ve never seen JSON like this: ', json);
		}

		canvas.renderAll();
	};

	


});