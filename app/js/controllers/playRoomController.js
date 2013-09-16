'use strict';

app.controller('playRoomController', function NormalModeController($scope, $filter) {

	var gamePlay = new Game();
	var clients = [];
	var bots = [];
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
			moveHorizontal(ctrls);

		} else if (key === 38) {

			ctrls.angle = 0;
			moveVertical(ctrls);

		} else if (key === 39) {

			ctrls.angle = 90;
			moveHorizontal(ctrls);

		} else if (key === 40) {

			ctrls.angle = 180;
			moveVertical(ctrls);
		}

		ctrls.isMoving = true;

	};


	function hostCreate() {

		gamePlay.initObj(function(client) {
			clients.push(client);
			console.log(clients);
		});

		for (var i = 3; i > 0; i--) {
			
			gamePlay.botAdd(function(bot) {
				bots.push(bot);
				console.log(bots);
			});
		};



	};

	/*
	 *	Move vertical
	 */

	function moveVertical(ctrls) {

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
			var curntPos = clients[index].client.getTop(),
				objHeight = clients[index].client.getHeight(),
				curntPosOld = curntPos;

			//Calculate top position of obj
			curntPos = ctrls.angle < 180 ? curntPos - ctrls.speed : curntPos + ctrls.speed;

			if (curntPos + objHeight / 2 >= canvHeight || curntPos - objHeight / 2 <= 0) {
				curntPos = curntPosOld;
			};

			clients[index].client.set({
				top: curntPos,
				angle: ctrls.angle
			});

			canvas.renderAll();


		}, ctrls.fps);

	}

	/*
	 *	Move vertical
	 */

	function moveHorizontal(ctrls) {

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
			var curntPos = clients[index].client.getLeft(),
				objHeight = clients[index].client.getHeight(),
				curntPosOld = curntPos;

			//Calculate left position of obj
			curntPos = ctrls.angle < 180 ? curntPos + ctrls.speed : curntPos - ctrls.speed;

			if (curntPos + objHeight / 2 >= canvWidth || curntPos - objHeight / 2 <= 0) {
				curntPos = curntPosOld;
			};

			clients[index].client.set({
				left: curntPos,
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