"use strict"
var Game = function($scope) {
	var self = this;

	// Clients and bots
	self.objCollection = {};
	self.botStart = [20, 282, 575];

	self.isMoving = false;

	self.botCount = 20;

	//Index of player
	var clientIndex = 0;

	//Random angles
	self.rdAngArr = [0, 90, 180, 270];

	// Cnvas 
	self.canvas = new fabric.Canvas('playRoomField');
	self.canvas2 = new fabric.Canvas('bulletsField');

	var CANVAS_WIDTH = self.canvas.getWidth(),
		CANVAS_HEIGHT = self.canvas.getHeight();

	// Controls parametrs
	self.clientCtrl = {
		type: 1,
		speed: 2,
		appearMode: true,
		isMoving: false,
		isShoot: false,
		angle: 0,
		score: 0
	};

	self.botCtrl = {
		type: 2,
		speed: 1,
		appearMode: true,
		isMoving: true,
		isShoot: false,
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

		var curentBot = self.objCollection.clients[clientIndex];

		if (key >= 37 && key <= 40) {

			// Switch move flag
			curentBot.bot.newAttribute.isMoving = false;

		}

	};


	window.onkeydown = function(e) {
		var key = e.keyCode;

		var curentBot = self.objCollection.clients[clientIndex];

		//Check if it move is moving
		if (curentBot.bot.newAttribute.isMoving) return false;

		//Check if arrow pressed
		if (key === 37) {

			curentBot.bot.newAttribute.isMoving = true;
			curentBot.bot.newAttribute.angle = 270;
		} else if (key === 38) {

			curentBot.bot.newAttribute.isMoving = true;
			curentBot.bot.newAttribute.angle = 0;
		} else if (key === 39) {

			curentBot.bot.newAttribute.isMoving = true;
			curentBot.bot.newAttribute.angle = 90;
		} else if (key === 40) {

			curentBot.bot.newAttribute.isMoving = true;
			curentBot.bot.newAttribute.angle = 180;
		};

		if (key === 32 && !curentBot.bot.newAttribute.isShoot) {

			curentBot.bot.newAttribute.isShoot = true;
		}
	};


	/*
	 *	Move client
	 */
	self.update = function() {

		for (var prop in self.objCollection) {

			self.objCollection[prop].forEach(function(curentBot, i) {

				if (curentBot.bot.newAttribute.type === 1 && i === 1) {
					console.log(curentBot.bot.newAttribute.isShoot);
				};


				if (curentBot.bot.newAttribute.isShoot) {

					if (curentBot.blt === null) {
						self.shoot(curentBot);
					};

					self.updateBullet(curentBot);
				};

				//If bot stoped, then skeep
				if (!curentBot.bot.newAttribute.isMoving) return false;

				//If bot destroed, then skeep
				if (curentBot.bot.isCrashed) return false;

				var angle = curentBot.bot.newAttribute.angle,
					left = curentBot.bot.left,
					top = curentBot.bot.top,
					topOld = top,
					leftOld = left;

				//Bots behave
				if (curentBot.bot.newAttribute.type === 2) {

					//if true change direction
					if (0.01 > Math.random()) {
						angle = curentBot.bot.newAttribute.angle = self.rdAng();
					}

					//if true then shoot!
					if (0.01 > Math.random()) {
						curentBot.bot.newAttribute.isShoot = true;
					}

				};

				//Check the direction
				if (angle === 0 || angle === 180) {

					//Calculate top position of obj
					top = angle < 180 ? top - curentBot.bot.newAttribute.speed : top + curentBot.bot.newAttribute.speed;

					var collide = self.checkCollision(left, top, curentBot);


					if (!collide && curentBot.bot.newAttribute.appearMode) {
						curentBot.bot.newAttribute.appearMode = false;
					};

					//Check also if it just apper on map
					if (collide.type === 2 && !curentBot.bot.newAttribute.appearMode || collide.type == 1) {

						top = topOld;

						//If  this bot change the ange
						if (curentBot.bot.newAttribute.type === 2) {
							curentBot.bot.newAttribute.angle = self.rdAng(angle);
						};
					};

				} else {

					//Calculate left position of obj
					left = angle < 180 ? left + curentBot.bot.newAttribute.speed : left - curentBot.bot.newAttribute.speed;

					var collide = self.checkCollision(left, top, curentBot);

					if (!collide && curentBot.bot.newAttribute.appearMode) {
						curentBot.bot.newAttribute.appearMode = false;
					};

					//Check also if it just apper on map
					if (collide.type === 2 && !curentBot.bot.newAttribute.appearMode || collide.type == 1) {

						left = leftOld;

						//If  this bot change the ange
						if (curentBot.bot.newAttribute.type === 2) {
							curentBot.bot.newAttribute.angle = self.rdAng(angle);
						};
					};

				};


				curentBot.bot.set({
					left: left,
					top: top,
					angle: curentBot.bot.newAttribute.angle
				});


			});
		}

	};

	self.updateBullet = function(curentBot) {

		var angle = curentBot.blt.ctrl.angle = curentBot.blt.bullet.angle,
			left = curentBot.blt.bullet.left,
			top = curentBot.blt.bullet.top;


		//Check the direction
		if (angle === 0 || angle === 180) {

			//Calculate top position of obj
			top = angle < 180 ? top - curentBot.blt.ctrl.speed : top + curentBot.blt.ctrl.speed;

			if (self.checkTarget(left, top, curentBot)) {

				curentBot.ctrl.score++;
			};

		} else {

			//Calculate left position of obj
			left = angle < 180 ? left + curentBot.blt.ctrl.speed : left - curentBot.blt.ctrl.speed;

			if (self.checkTarget(left, top, curentBot)) {

				curentBot.ctrl.score++;
			};

		};

		//if bullet was deleted 
		if (curentBot.blt !== null) {

			curentBot.blt.bullet.set({
				left: left,
				top: top
			});

		};



	};

	//Check for collision
	self.checkCollision = function(_x2, _y2, curentBot) {

		var collision = false;


		var _size2 = curentBot.bot.getHeight() / 2;

		if (_y2 + _size2 >= CANVAS_HEIGHT || 0 > _y2 - _size2 ||
			_x2 + _size2 >= CANVAS_WIDTH || 0 > _x2 - _size2) {

			return {
				type: 1
			};
		}

		for (var prop in self.objCollection) {

			self.objCollection[prop].forEach(function(value) {

				if (curentBot.bot === value.bot || value.bot.isCrashed) {
					return false
				};

				//Get dimentions of obj
				var x1 = value.bot.left,
					y1 = value.bot.top,
					size1 = value.bot.height / 2;

				//Distanse
				var dist = size1 + _size2 - 4;

				var xDist = x1 - _x2;
				var yDist = y1 - _y2;

				var hyp = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (hyp < dist) {

					collision = {
						type: 2
					};
				};
			});

		}

		return collision;
	};

	self.shoot = function(curentBot) {


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

		self.canvas2.add(blt);

		//Change default angle of model
		self.bulletCtrl.angle = angle;

		curentBot.blt = {
			bullet: blt,
			ctrl: self.extend({}, self.bulletCtrl)
		};
	};


	self.checkTarget = function(_x2, _y2, curentBot) {


		var _size2 = curentBot.blt.bullet.height / 2;

		if (0 > _y2 - _size2 || _y2 + _size2 >= CANVAS_HEIGHT ||
			0 > _x2 - _size2 || _x2 + _size2 >= CANVAS_WIDTH) {

			/*
			 * Out of area
			 */
			self.canvas2.remove(curentBot.blt.bullet);
			curentBot.blt = null;
			curentBot.bot.newAttribute.isShoot = false;

			return false

		}

		for (var prop in self.objCollection) {

			self.objCollection[prop].forEach(function(value, index) {

				if (curentBot.bot === value.bot ||
					value.bot.newAttribute.type === curentBot.bot.newAttribute.type || value.bot.isCrashed) {
					return false;
				};

				//Get dimentions of obj
				var x1 = value.bot.left,
					y1 = value.bot.top,
					size1 = value.bot.height / 2;

				//Distanse
				var dist = size1 + _size2 - 4;

				var xDist = x1 - _x2;
				var yDist = y1 - _y2;

				var hyp = Math.sqrt((xDist * xDist) + (yDist * yDist));

				if (hyp < dist) {

					self.explode(value, self.objCollection[prop], index);

					if (curentBot.bot.newAttribute.type == 1) {
						$scope.score = curentBot.bot.newAttribute.score += 1;
					}

					self.canvas2.remove(curentBot.blt.bullet);
					curentBot.blt = null;
					curentBot.bot.newAttribute.isShoot = false;

					return true;

				};

			});

		};

		return false;

	};

	self.explode = function(crashedBot, collection, index) {

		//change bg of tank
		crashedBot.bot.fill.offsetX = -36;

		//switch flag to check if this bot crashed
		crashedBot.bot.isCrashed = true;

		//Delete object from canvas with some delay
		var timer = setTimeout(function() {

			self.canvas.remove(crashedBot.bot);

			$scope.botCounterAdd();

		}, 500);

	};

	self.getCanvas = function() {
		return this.canvas;
	};
	self.getCanvas2 = function() {
		return this.canvas2;
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

	self.getId = function(callBack) {

		var _id = Math.random().toString(36).substring(2);

		for (var prop in self.objCollection) {
			for (var i = 0, len = self.objCollection[prop].length; i < len; i++) {

				if (_id == self.objCollection[prop][i]._id) {
					arguments.callee();
				};

			};
		};

		return _id;

	};

	self.getNewUnitId = function() {

		var obj = self.canvas.getObjects();

		var _id = Math.random().toString(36).substring(2);

		for (var i = obj.length - 1; i >= 0; i--) {

			//We need unic id to compare with new id
			var unicId = obj[i]._id.split('_').pop();

			if (_id === unicId) {
				arguments.callee();
			};


		};

		return _id;

	};

	self.addThisUnit = function(newUnit) {

		//We need to know if the object is loaded on host
		if (typeof newUnit.fill !== 'object') {
			return false
		};

		//Add new tank to canvas and render it
		self.canvas.add(new fabric.Rect(newUnit)).renderAll();

		self.resetNewObjects();

	};
	self.removeThisUnit = function(removeThis) {

		$.each(self.canvas.getObjects(), function(key, value) {
			if (removeThis._id === value._id) {
				value.fill.offsetX = -36;

				setTimeout(function() {
					self.canvas.remove(value);
				}, 500);
			};
		});
	};

	self.updateThisUnit = function(destination, updateThis) {
		$.each(self.canvas.getObjects(), function(key, value) {
			if (updateThis._id === value._id) {

				var temporObj = self.extendReqiredKeys(destination, updateThis);
				$.extend(true, value, temporObj);
			};
		});
	};

	self.resetNewObjects = function() {

		$.each(self.canvas.getObjects(), function(key, value) {
			if (value.isNew && typeof value.fill === 'object') {
				value.isNew = false;
			};
		});
	}
	self.minimizeClients = function() {
		var clients = [];

		objCollection.clients.forEach(function(valur, key) {
			if (value.isNew) {
				clients.push(value);
			} else if (value.isCrashed) {
				clients.push(self.extendReqiredKeys({
					_id: null,
					isCrashed: null
				}, value));
			} else {
				var defaultParamsForClient = {
					_id: null,
					left: null,
					top: null,
					angle: null,
					newAttribute: {
						isMoving: null,
						isShoot: null,
						angle: null,
					}
				};
				clients.push(self.extendReqiredKeys(defaultParamsForClient, value));
			};

		});

		return clients;
	};

	self.extendReqiredKeys = function(destination, source) {

		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object && property in destination) {
				destination[property] = destination[property] || {};
				self.extendReqiredKeys(destination[property], source[property]);

			} else if (property in destination) {
				destination[property] = source[property];
			}
		}
		return destination;

	};

	self.getBltCtrl = function() {
		return self.extend({}, self.bulletCtrl);
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