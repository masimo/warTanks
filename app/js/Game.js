var Game = {
	clients: [],
	bots: [],
	ctrlParams: {
		type: 1,
		direction: '',
		speed: 5,
		isMoving: null,
		fps: 50
	},

	initObj: function() {
		var canvas = new fabric.Canvas('playRoomField');

		var rect = new fabric.Rect({
			left: 300,
			top: 550,
			width: 75,
			height: 100,
			fill: 'green',
			angle: 0,
			padding: 10,
			selectable: false
		});

		canvas.add(rect);

		objArray.push(rect);
	};
}


Game.prototype.move = function(pos) {
	var self = this;

	setTimeout(function() {
		self.move(pos + self.tankSpeed, true);
	}, self.fps);
}

var Map = function(args) {

};