'use strict';

app.controller('playRoomController', function NormalModeController($scope, $filter) {

	var gamePlay = new Game();
	var clients = [];
	var bots = [];
	var botsCons = [];
	var index = 0;
	var oldKey = '';
	$scope.clientTop = 575;

	window.onkeydown = function(e) {
		var key = e.keyCode;
		var ctrls = clients[index].ctrl

		//Check if it move is moving
		if (ctrls.isMoving) return false;

		//Check if arrow pressed
		if (key === 37) {
			ctrls.angle = 270;
			move(ctrls);

		} else if (key === 38) {

			ctrls.angle = 0;
			move(ctrls);

		} else if (key === 39) {

			ctrls.angle = 90;
			move(ctrls);

		} else if (key === 40) {

			ctrls.angle = 180;
			move(ctrls);
		}

		ctrls.isMoving = true;

	};


	function hostCreate() {

		var canvas = gamePlay.getCanvas();

		gamePlay.initObj(function(client) {
			clients.push(client);

		});

		for (var i = 0, len = 3; i < len; i++) {

			gamePlay.botAdd(function(bot) {

				bots.push(bot);

				new BotEngin(bot, canvas, bots, clients);


			});
		};

	};


	/*
	 *	Move client
	 */

	function move(ctrls) {

		//check if all is good:0
		if (!clients.length) {
			return false
		};

		//get canvas
		var canvas = gamePlay.getCanvas(),
			canvWidth = canvas.width,
			canvHeight = canvas.height;


		ctrls.interval = setInterval(function() {

			//get top position
			var top = clients[index].client.getTop(),
				left = clients[index].client.getLeft(),
				objHeight = clients[index].client.getHeight(),
				topOld = top,
				leftOld = left;

			if (ctrls.angle === 0 || ctrls.angle === 180) {

				//Calculate top position of obj
				top = ctrls.angle < 180 ? top - ctrls.speed : top + ctrls.speed;

				if (top + objHeight / 2 >= canvHeight || top - objHeight / 2 <= 0) {
					top = topOld;
				};

			} else {

				//Calculate left position of obj
				left = ctrls.angle < 180 ? left + ctrls.speed : left - ctrls.speed;

				if (left + objHeight / 2 >= canvWidth || left - objHeight / 2 <= 0) {
					left = leftOld;
				};

			};

			clients[index].client.set({
				top: top,
				left: left,
				angle: ctrls.angle
			});

			canvas.renderAll();

		}, ctrls.fps);

	}

	hostCreate();



	window.onkeyup = function(e) {
		var key = e.keyCode;

		var ctrls = clients[index].ctrl;

		// Switch move flag
		ctrls.isMoving = false;

		if (key === 37) {

			clearInterval(ctrls.interval);

		} else if (key === 38) {

			clearInterval(ctrls.interval);


		} else if (key === 39) {

			clearInterval(ctrls.interval);

		} else if (key === 40) {

			clearInterval(ctrls.interval);
		}

	};


});