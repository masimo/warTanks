"use strict"
var Game = function() {
	var self = this;

	// Clients and bots
	self.objCollection = {};
	self.botStart = [20, 282, 575];

	self.isMoving = false;

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
	self.clientCtrl = {
		type: 1,
		speed: 3,
		bulletSpeed: 8,
		appearMode: true,
		bulletInterval: null,
		isMoving: false,
		fps: 50,
		interval: null,
		angle: 0,
		score: 0
	};

	self.botCtrl = {
		type: 2,
		speed: 1,
		appearMode: true,
		bulletSpeed: 15,
		isMoving: true,
		fps: 50,
		interval: null,
		angle: 180,
		score: 0
	};

	self.bulletCtrl = {
		type: 3,
		speed: 5,
		isMoving: true,
		angle: 180
	};


	//User interaction 
	window.onkeyup = function(e) {
		var key = e.keyCode;

		var sctiveBot = self.objCollection.clients[index];

		if (key >= 37 && key <= 40) {

			// Switch move flag
			sctiveBot.ctrl.isMoving = false;

		}

	};


	window.onkeydown = function(e) {
		var key = e.keyCode;

		var sctiveBot = self.objCollection.clients[index];

		//Check if it move is moving
		if (sctiveBot.ctrl.isMoving) return false;

		//Check if arrow pressed
		if (key === 37) {

			sctiveBot.ctrl.angle = 270;
		} else if (key === 38) {

			sctiveBot.ctrl.angle = 0;
		} else if (key === 39) {

			sctiveBot.ctrl.angle = 90;
		} else if (key === 40) {

			sctiveBot.ctrl.angle = 180;
		};

		if (key === 32) {

			//self.shoot(sctiveBot);
		}

		sctiveBot.ctrl.isMoving = true;
	};


	/*
	 *	Move client
	 */


	self.update = function() {

		for (var prop in self.objCollection) {

			self.objCollection[prop].forEach(function(curentBot, i) {

				//If bot stoped skeep 
				if (!curentBot.ctrl.isMoving) return false;

				var angle = curentBot.ctrl.angle,
					left = curentBot.bot.left,
					top = curentBot.bot.top,
					topOld = top,
					leftOld = left;

				//Bots behave
				if (curentBot.ctrl.type === 2) {

					//if true change direction
					if (0.01 > Math.random()) {
						angle = curentBot.ctrl.angle = self.rdAng();
					}

					//if true then shoot!
					if (0.01 > Math.random()) {

						self.shoot(curentBot);
						console.log(curentBot.clientName + ' shot')
						//shoot
					}

				};

				//Check the direction
				if (angle === 0 || angle === 180) {

					//Calculate top position of obj
					top = angle < 180 ? top - curentBot.ctrl.speed : top + curentBot.ctrl.speed;

					if (self.checkCollision(left, top, curentBot)) {
						top = topOld;

						//If  this bot change the ange
						if (curentBot.ctrl.type === 2) {
							curentBot.ctrl.angle = self.rdAng(angle);
						};
					};

				} else {

					//Calculate left position of obj
					left = angle < 180 ? left + curentBot.ctrl.speed : left - curentBot.ctrl.speed;

					if (self.checkCollision(left, top, curentBot)) {
						left = leftOld;

						//If  this bot change the ange
						if (curentBot.ctrl.type === 2) {
							curentBot.ctrl.angle = self.rdAng(angle);
						};
					};

				};

				curentBot.bot.set({
					left: left,
					top: top,
					angle: curentBot.ctrl.angle
				});


				//Check if this is bullet
				if (curentBot.ctrl.type === 3) {

					//Check if bullet hit the target
					self.checkTarget(left, top, curentBot);
				};

			});
		}

	};


	//Check for collision
	self.checkCollision = function(_x2, _y2, curentBot) {

		var self = this;

		var collide = false;


		var _size2 = curentBot.bot.getHeight() / 2;

		if (_y2 + _size2 >= CANVAS_HEIGHT || 0 > _y2 - _size2 ||
			_x2 + _size2 >= CANVAS_WIDTH || 0 > _x2 - _size2) {

			return true;
		}

		for (var prop in self.objCollection) {



			self.objCollection[prop].forEach(function(value) {

				if (curentBot.bot === value.bot) {
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

	self.shoot = function(curentBot) {


		var height = curentBot.bot.height;

		var left = curentBot.bot.left,
			top = curentBot.bot.top,
			angle = curentBot.bot.angle;


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

		self.objCollection.bullets.push({
			'clientName': 'big boom',
			bot: blt,
			ctrl: self.extend({}, self.bulletCtrl)
		});
	};


	self.checkTarget = function(_x2, _y2, curentBot) {

		var hited = false;

		var _size2 = curentBot.bot.height / 2;

		if (0 > _y2 - _size2 || _y2 + _size2 >= CANVAS_HEIGHT ||
			0 > _x2 - _size2 || _x2 + _size2 >= CANVAS_WIDTH) {

			//Out of area

			var arr = self.objCollection.bullets;
			
			self.canvas.remove(curentBot.bot);
			arr.splice(indexOf(curentBot), 1);

			return false

		}

		for (var prop in self.objCollection) {


			self.objCollection[prop].forEach(function(value, index) {


				if (curentBot.bot === value.bot || value.ctrl.type === curentBot.ctrl.type || ) {
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
						curentBot: curentBot,
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

	self.getCanvas = function() {
		return this.canvas;
	};

	self.getBotCtrl = function() {
		return self.botCtrl;
	};

	self.getClientCtrl = function() {
		return self.clientCtrl;
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