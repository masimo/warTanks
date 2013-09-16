var Game = function() {
	var self = this;
	// Clients and bots
	self.clients = [];
	self.bots = [];
	self.botStart = [18, 282, 582];

	// Cnvas 
	self.canvas = new fabric.Canvas('playRoomField');

	// Controls parametrs
	self.ctrlParams = {
		type: 1,
		speed: 5,
		isMoving: false,
		fps: 25,
		interval: null,
		angle: 0,
		score: 0
	};


	//Init Objects
	self.initObj = function(callback) {
		var name = name || 'defaultName';
		var self = this;

		fabric.Image.fromURL('./img/warTank1.png', function(img) {
			img.set({
				left: 200,
				top: 575,
				width: 36,
				height: 48,
				selectable: false,
				clipTo: function(ctx) {
					ctx.rect(-18, -24, 36, 48);
				}
			});

			self.canvas.add(img);

			callback({
				'clientName': name,
				client: img,
				ctrl: self.ctrlParams
			});

		});
	};

	//Create bot
	self.botAdd = function(callback) {
		var name = name || 'bot';
		var self = this;
		var obj = {};
		var pos = self.botStart.slice(0).sort(function() {
			return Math.random() > 0.5;
		}).shift();

		console.log(pos);

		fabric.Image.fromURL('./img/warTank2.png', function(img) {
			img.set({
				left: pos,
				top: 24,
				width: 36,
				angle: 180,
				height: 48,
				selectable: false,
				clipTo: function(ctx) {
					ctx.rect(-18, -24, 36, 48);
				}
			});

			self.canvas.add(img);

			callback({
				'clientName': name,
				bot: img,
				ctrl: self.ctrlParams
			});

		});
	};

	self.getCanvas = function() {
		return this.canvas;
	};

	self.initClient = function() {
		var canvas = new fabric.Canvas('playRoomField');


		fabric.Image.fromURL('../lib/pug.jpg', function(img) {

			canvas.add(img.set({
				left: 250,
				top: 250,
				angle: 30
			}).scale(0.25));


		});

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
	}
}



Game.prototype.move = function(pos) {
	var self = this;

	setTimeout(function() {
		self.move(pos + self.tankSpeed, true);
	}, self.fps);
}

var Map = function(args) {

};