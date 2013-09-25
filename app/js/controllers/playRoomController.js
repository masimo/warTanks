'use strict';

app.controller('playRoomController', function NormalModeController($scope, $filter) {

	var gamePlay = new Game();
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

	$scope.botCounter = 20;

	

	//Asign data to game constructor
	gamePlay.setCollection(objCollection);


	function hostCreate() {

		//Initialize client
		initClient();

		//Bot initialization
		for (var i = 0, len = 3; i < len; i++) {

			initBot();

		};

		canvas.renderAll();

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
	hostCreate();

	window.onEachFrame(function() {

		gamePlay.update();

		canvas.renderAll();
	});


	$scope.$watch('botCounter', function() {

		//If true then add new bot
		if ($scope.botCounter > 0) {
			
			initBot();
		};
	});


});