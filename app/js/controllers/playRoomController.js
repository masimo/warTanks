'use strict';


app.controller('playRoomController', function NormalModeController($scope, $filter) {

	var canvas = new fabric.Canvas('playRoomField');
	var rects = [];
	$scope.leftPosition = 300;


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
			padding: 10
		});
		canvas.add(rect);


		rects.push(rect);
	};


	$scope.$watch('leftPosition', moveRect);

	function moveRect() {

		rects[0].setTop($scope.leftPosition).setCoords();
	
		canvas.renderAll();
	}

});