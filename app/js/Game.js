"use strict"
var Game = function() {
	var self = this;

	// Clients and bots
	self.objCollection = {};
	self.botStart = [20, 282, 575];

	self.botCount = 20;

	//Index of player
	var index = 0;

	//Random angles
	self.rdAngArr = [0, 90, 180, 270];

	// Cnvas 
	self.canvas = new fabric.Canvas('playRoomField');

	var CANVAS_WIDTH = self.canvas.getWidth(),
		CANVAS_HEIGHT = self.canvas.getHeight();

	// Controls parametrs
	self.ctrlParams = {
		type: 1,
		speed: 5,
		bulletSpeed: 8,
		appearMode: true,
		bulletInterval: null,
		isMoving: false,
		fps: 25,
		interval: null,
		angle: 0,
		score: 0
	};

	self.ctrlBot = {
		type: 2,
		speed: 4,
		appearMode: true,
		bulletSpeed: 15,
		isMoving: false,
		fps: 75,
		interval: null,
		angle: 0,
		score: 0
	};

	//User interaction 
	window.onkeyup = function(e) {
		var key = e.keyCode;

		if (self.objCollection.clients[index] === undefined) return false;

		var ctrl = self.objCollection.clients[index].ctrl;



		// Switch move flag
		ctrl.isMoving = false;

		if (key === 37) {

			clearInterval(ctrl.interval);

		} else if (key === 38) {

			clearInterval(ctrl.interval);


		} else if (key === 39) {

			clearInterval(ctrl.interval);

		} else if (key === 40) {

			clearInterval(ctrl.interval);
		}

	};

	window.onkeydown = function(e) {
		var key = e.keyCode;

		if (self.objCollection.clients[index] === undefined) return false;

		var ctrl = self.objCollection.clients[index].ctrl

		//Check if it move is moving
		if (ctrl.isMoving) return false;

		//Check if arrow pressed
		if (key === 37) {
			ctrl.angle = 270;
			self.move(ctrl);

		} else if (key === 38) {

			ctrl.angle = 0;
			self.move(ctrl);

		} else if (key === 39) {

			ctrl.angle = 90;
			self.move(ctrl);

		} else if (key === 40) {

			ctrl.angle = 180;
			self.move(ctrl);

		};

		if (key === 32) {

			self.shoot(self.objCollection.clients[index]);
		}

		ctrl.isMoving = true;

	};



	//Init Clients
	self.initObj = function(callback) {
		var name = name || 'defaultName';
		var self = this;


		var rect = new fabric.Rect({
			left: 200,
			top: 575,
			width: 36,
			height: 48,
		});

		self.canvas.add(rect);

		fabric.util.loadImage('./img/warTank1_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0
			});

			callback({
				'clientName': name,
				bot: rect,
				ctrl: self.extend({}, self.ctrlParams)
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
		var angle = self.rdAng();

		console.log(pos);

		var rect = new fabric.Rect({
			left: pos,
			top: 24,
			width: 36,
			height: 48,
			angle: 180
		});

		self.canvas.add(rect);

		fabric.util.loadImage('./img/warTank2_small.png', function(img) {
			rect.fill = new fabric.Pattern({
				source: img,
				repeat: 'no-repeat',
				offsetX: 0
			});

			callback({
				'clientName': name,
				bot: rect,
				ctrl: self.extend({}, self.ctrlBot)
			});

		});

	};

	/*
	 *	Move client
	 */

	self.move = function(ctrl) {


		ctrl.interval = setInterval(function() {

			//get top position
			var top = self.objCollection.clients[index].bot.getTop(),
				left = self.objCollection.clients[index].bot.getLeft(),
				objHeight = self.objCollection.clients[index].bot.getHeight(),
				topOld = top,
				leftOld = left;

			//Chech the direction
			if (ctrl.angle === 0 || ctrl.angle === 180) {

				//Calculate top position of obj
				top = ctrl.angle < 180 ? top - ctrl.speed : top + ctrl.speed;

				if (self.checkCollision(left, top, self.objCollection.clients[index])) {
					top = topOld;
				};

			} else {

				//Calculate left position of obj
				left = ctrl.angle < 180 ? left + ctrl.speed : left - ctrl.speed;

				if (self.checkCollision(left, top, self.objCollection.clients[index])) {
					left = leftOld;
				};

			};

			//Change object properties
			self.objCollection.clients[index].bot.set({
				top: top,
				left: left,
				angle: ctrl.angle
			});

			self.canvas.renderAll();

		}, ctrl.fps);

	}
	self.botEngin = function(curentBut) {

		var bot = curentBut.bot;
		var ctrl = curentBut.ctrl;


		ctrl.interval = setInterval(function() {

			// Chosse direction
			var direc = Math.random();


			var objHeight = bot.getHeight();

			//all about position
			var left = bot.getLeft(),
				top = bot.getTop(),
				angle = bot.getAngle(),
				leftOld = left,
				topOld = top;

			//choose shoot or not
			var shoot = Math.random();

			// if true get new angle
			if (0.97 < direc) {
				angle = self.rdAng();
			};



			//if true then shoot!
			if (shoot > 0.99) {
				self.shoot(curentBut);
			};

			if (angle === 0 || angle === 180) {

				//Calculate top position of obj
				top = angle < 180 ? top - ctrl.speed : top + ctrl.speed;

				var collide = self.checkCollision(left, top, curentBut);

				if (!collide && ctrl.appearMode) {
					ctrl.appearMode = false;
				}

				if (collide && !ctrl.appearMode) {
					top = topOld;
					angle = self.rdAng(angle);
				};

			} else {

				//Calculate left position of obj
				left = angle < 180 ? left + ctrl.speed : left - ctrl.speed;

				var collide = self.checkCollision(left, top, curentBut);

				if (!collide && ctrl.appearMode) {
					ctrl.appearMode = false;
				}

				if (collide && !ctrl.appearMode) {
					left = leftOld;
					angle = self.rdAng(angle);
				};

			}

			bot.set({
				top: top,
				left: left,
				angle: angle
			});

			self.canvas.renderAll();

		}, ctrl.fps);

	};

	//Check for collision
	self.checkCollision = function(_x2, _y2, activeBot) {

		var self = this;

		var collide = false;


		var _size2 = activeBot.bot.getHeight() / 2;

		if (_y2 + _size2 >= CANVAS_HEIGHT || 0 > _y2 - _size2 ||
			_x2 + _size2 >= CANVAS_WIDTH || 0 > _x2 - _size2) {

			return true;
		}

		for (var prop in self.objCollection) {



			self.objCollection[prop].forEach(function(value) {


				if (activeBot.bot === value.bot) {
					return false
				};

				//Get dimentions of obj
				var x1 = value.bot.getLeft(),
					y1 = value.bot.getTop(),
					size1 = value.bot.getHeight() / 2;

				//Distanse
				var dist = size1 + _size2 - 4;

				var xDist = x1 - _x2;
				var yDist = y1 - _y2;

				var hyp = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (hyp < dist) {

					collide = true;
				};
			});

		}

		return collide;
	};


	self.getCanvas = function() {
		return this.canvas;
	};


	self.setCollection = function(obj) {
		this.objCollection = obj;
	};

	self.extend = function(destination, source) {

		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;

	};



	self.shoot = function(target) {

		if (target.ctrl.bulletInterval) return false;

		var left = target.bot.getLeft(),
			top = target.bot.getTop(),
			angle = target.bot.getAngle();

		var blt = new fabric.Rect({
			left: left,
			top: top,
			width: 6,
			height: 6,
			angle: angle,
			fill: 'red',
			selectable: false
		});

		self.canvas.add(blt);

		target.ctrl.bulletInterval = setInterval(function() {



			if (angle === 0 || angle === 180) {

				//Calculate top position of obj
				blt.top = angle < 180 ? blt.top - target.ctrl.bulletSpeed : blt.top + target.ctrl.bulletSpeed;

				var isHited = self.checkTarget(blt.left, blt.top, blt, target);

				if (isHited && typeof isHited === 'object') {

					// Delete obj from array with delay
					self.explode(isHited);

				};

			} else {

				//Calculate left position of obj
				blt.left = angle < 180 ? blt.left + target.ctrl.bulletSpeed : blt.left - target.ctrl.bulletSpeed;

				var isHited = self.checkTarget(blt.left, blt.top, blt, target);

				if (isHited && typeof isHited === 'object') {

					// Delete obj from array with delay
					self.explode(isHited);
				};

			};

			self.canvas.renderAll();

		}, target.ctrl.fps);

	};
	self.checkTarget = function(_x2, _y2, blt, activeBot) {

		var self = this;

		var hited = false;

		var _size2 = blt.getHeight() / 2;

		if (0 > _y2 - _size2 || _y2 + _size2 >= CANVAS_HEIGHT ||
			0 > _x2 - _size2 || _x2 + _size2 >= CANVAS_WIDTH) {

			clearInterval(activeBot.ctrl.bulletInterval);
			activeBot.ctrl.bulletInterval = null;

			self.canvas.remove(blt);


		}

		for (var prop in self.objCollection) {


			self.objCollection[prop].forEach(function(value, index) {


				if (activeBot.bot === value.bot || value.ctrl.type === activeBot.ctrl.type) {
					return false;
				};

				//Get dimentions of obj
				var x1 = value.bot.getLeft(),
					y1 = value.bot.getTop(),
					size1 = value.bot.getHeight() / 2;

				//Distanse
				var dist = size1 + _size2 - 4;

				var xDist = x1 - _x2;
				var yDist = y1 - _y2;

				var hyp = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (hyp < dist) {

					hited = {
						activeBot: activeBot,
						collection: self.objCollection[prop],
						value: value,
						index: index,
						blt: blt
					}

				};

			});

		};

		return hited;

	};

	self.explode = function(boom) {

		//remove bullet
		self.canvas.remove(boom.blt);

		//if heat clear time intervals for move and bullet
		clearInterval(boom.activeBot.ctrl.bulletInterval);
		clearInterval(boom.value.ctrl.interval);

		boom.activeBot.ctrl.bulletInterval = null;
		boom.value.ctrl.interval = null;

		//change bg of tank
		boom.value.bot.fill.offsetX = -36;

		//Delete item from array
		boom.collection.splice(boom.index, 1);


		var timer = setTimeout(function() {

			self.canvas.remove(boom.value.bot);

		}, 500);
	}

	self.rdAng = function(not) {

		var self = this;

		// Get array of posible angles
		var arr = self.rdAngArr.slice(0);

		// Cut undesirable angle
		if (not != undefined) {

			for (var i in arr) {
				if (arr[i] === not) {
					arr.splice(i, 1);
				}
			}
		};

		//Return random angle
		return arr.sort(function() {
			return Math.random() > 0.5
		})[0];
	};


}