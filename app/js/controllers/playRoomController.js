'use strict';

app.controller('playRoomController', function NormalModeController($scope, $filter) {

	var canvas = new fabric.Canvas('playRoomField');
	var objArray = [];
	$scope.leftPosition = 300;
	var ctrlParams = {
		type: 1,
		direction: '',
		speed: 5,
		isMoving: null
	};

	var gamePlay = new Game();


	for (var i = 3; i > 0; i--) {

		var color = Math.random().toString(16).substring(5).substr(0, 6);
		var _LEFT = Math.random() * 300;
		var _TOP = Math.random() * 300;

		var rect = new fabric.Rect({
			left: _LEFT,
			top: _TOP,
			width: 30,
			height: 45,
			fill: '#' + color,
			angle: 0,
			padding: 10,
			selectable: false
		});

		canvas.add(rect);

		objArray.push(rect);
	};


	

	window.onkeydown = function(e) {
		var key = e.keyCode;
		if (key === 37) {

			ctrlParams.direction = 'left';
			movement(true);

		} else if (key === 38) {

			ctrlParams.direction = 'top';
			movement(true);

		} else if (key === 39) {

			ctrlParams.direction = 'left';
			movement(true);

		} else if (key === 40) {

			ctrlParams.direction = 'top';
			movement(true);
		}


	};

	function movement() {
		if (act) {
			var ctrlParams.isMoving = setInterval(function() {
				var curntPos = objArray[0].getLeft();
				objArray[0].setLeft(curntPos - 5).setAngle(90).setCoords();
				canvas.renderAll();
			}, 50);
		};
	}

	/*
	window.onkeyup = function(e) {
		var key = e.keyCode;
		if (key === 37) {

			

		} else if (key === 38) {

			setTimeout(function() {
				var curntPos = objArray[0].getTop();
				objArray[0].setTop(curntPos - 5).setAngle(0).setCoords();
				canvas.renderAll();
			}, 50);


		} else if (key === 39) {

			setTimeout(function() {
				var curntPos = objArray[0].getLeft();
				objArray[0].setLeft(curntPos + 5).setAngle(90).setCoords();
				canvas.renderAll();
			}, 50);

			// right arrow
		} else if (key === 40) {

			setTimeout(function() {
				var curntPos = objArray[0].getTop();
				objArray[0].setTop(curntPos + 5).setAngle(0).setCoords();
				canvas.renderAll();
			}, 50);

		}

	};*/



});