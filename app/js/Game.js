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
		bulletSpeed: 8,
		appearMode: true,
		bulletInterval: null,
		isMoving: false,
		isShoot: false,
		interval: null,
		crashed: false,
		newObj: true,
		angle: 0,
		score: 0
	};

	self.botCtrl = {
		type: 2,
		speed: 1,
		appearMode: true,
		bulletSpeed: 15,
		isMoving: true,
		isShoot: false,
		interval: null,
		crashed: false,
		newObj: true,
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
			curentBot.ctrl.isMoving = false;

		}

	};


	window.onkeydown = function(e) {
		var key = e.keyCode;

		var curentBot = self.objCollection.clients[clientIndex];

		//Check if it move is moving
		if (curentBot.ctrl.isMoving) return false;

		//Check if arrow pressed
		if (key === 37) {

			curentBot.ctrl.isMoving = true;
			curentBot.ctrl.angle = 270;
		} else if (key === 38) {

			curentBot.ctrl.isMoving = true;
			curentBot.ctrl.angle = 0;
		} else if (key === 39) {

			curentBot.ctrl.isMoving = true;
			curentBot.ctrl.angle = 90;
		} else if (key === 40) {

			curentBot.ctrl.isMoving = true;
			curentBot.ctrl.angle = 180;
		};

		if (key === 32 && !curentBot.ctrl.isShoot) {

			self.shoot(curentBot);
			curentBot.ctrl.isShoot = true;
			//self.shoot(curentBot);
		}


	};

	/*
	 *	Move client
	 */


	self.update = function() {

		for (var prop in self.objCollection) {

			self.objCollection[prop].forEach(function(curentBot, i) {


				if (curentBot.ctrl.isShoot) {

					self.updateBullet(curentBot);
				};

				//If bot stoped, then skeep 
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
					if (0.01 > Math.random() && !curentBot.ctrl.isShoot) {

						self.shoot(curentBot);
						curentBot.ctrl.isShoot = true;

						//shoot
					}

				};

				//Check the direction
				if (angle === 0 || angle === 180) {

					//Calculate top position of obj
					top = angle < 180 ? top - curentBot.ctrl.speed : top + curentBot.ctrl.speed;

					var collide = self.checkCollision(left, top, curentBot);


					if (!collide && curentBot.ctrl.appearMode) {
						curentBot.ctrl.appearMode = false;
					};

					//Check also if it just apper on map
					if (collide.type === 2 && !curentBot.ctrl.appearMode || collide.type == 1) {

						top = topOld;

						//If  this bot change the ange
						if (curentBot.ctrl.type === 2) {
							curentBot.ctrl.angle = self.rdAng(angle);
						};
					};

				} else {

					//Calculate left position of obj
					left = angle < 180 ? left + curentBot.ctrl.speed : left - curentBot.ctrl.speed;

					var collide = self.checkCollision(left, top, curentBot);

					if (!collide && curentBot.ctrl.appearMode) {
						curentBot.ctrl.appearMode = false;
					};

					//Check also if it just apper on map
					if (collide.type === 2 && !curentBot.ctrl.appearMode || collide.type == 1) {

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


			});
		}

	};

	self.updateClient = function() {


		self.objCollection.clients.forEach(function(curentBot, i) {


			if (curentBot.ctrl.isShoot) {

				self.updateBullet(curentBot);
			};

			//Bots behave
			if (curentBot.ctrl.type === 2) return false;

			//If bot stoped, then skeep 
			if (!curentBot.ctrl.isMoving) return false;


			var angle = curentBot.ctrl.angle,
				left = curentBot.bot.left,
				top = curentBot.bot.top,
				topOld = top,
				leftOld = left;



			//Check the direction
			if (angle === 0 || angle === 180) {

				//Calculate top position of obj
				top = angle < 180 ? top - curentBot.ctrl.speed : top + curentBot.ctrl.speed;

				var collide = self.checkCollision(left, top, curentBot);


				if (!collide && curentBot.ctrl.appearMode) {
					curentBot.ctrl.appearMode = false;
				};

				//Check also if it just apper on map
				if (collide.type === 2 && !curentBot.ctrl.appearMode || collide.type == 1) {

					top = topOld;

					//If  this bot change the ange
					if (curentBot.ctrl.type === 2) {
						curentBot.ctrl.angle = self.rdAng(angle);
					};
				};

			} else {

				//Calculate left position of obj
				left = angle < 180 ? left + curentBot.ctrl.speed : left - curentBot.ctrl.speed;

				var collide = self.checkCollision(left, top, curentBot);

				if (!collide && curentBot.ctrl.appearMode) {
					curentBot.ctrl.appearMode = false;
				};

				//Check also if it just apper on map
				if (collide.type === 2 && !curentBot.ctrl.appearMode || collide.type == 1) {

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


		});


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

				if (curentBot.bot === value.bot) {
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

		/*		//add additional atribute to rectanle
		blt.toObject = (function(toObject) {
			return function() {
				return fabric.util.object.extend(toObject.call(this), {
					_id: this._id
				});
			};
		})(blt.toObject);

		blt._id = 'bullet_' + gamePlay.getNewUnitId();*/

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

			//Out of area

			self.canvas2.remove(curentBot.blt.bullet);
			curentBot.blt = null;
			curentBot.ctrl.isShoot = false;

			return false

		}

		for (var prop in self.objCollection) {

			self.objCollection[prop].forEach(function(value, index) {

				if (curentBot.bot === value.bot ||
					value.ctrl.type === curentBot.ctrl.type) {
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

					if (curentBot.ctrl.type == 1) {
						$scope.score = curentBot.ctrl.score += 1;
					}

					self.canvas2.remove(curentBot.blt.bullet);
					curentBot.blt = null;
					curentBot.ctrl.isShoot = false;

					return true;

				};

			});

		};

		return false;

	};

	self.explode = function(crashedBot, collection, index) {

		//change bg of tank
		crashedBot.bot.fill.offsetX = -36;


		//Delete item from array
		if (crashedBot.ctrl.isShoot) {

			crashedBot.ctrl.crashed = true;
			crashedBot.ctrl.isMoving = false;

			var timer = setTimeout(function() {

				if (crashedBot.blt !== null) {
					self.canvas2.remove(crashedBot.blt.bullet);
				}

				//switch flag to check if this bot crashed
				crashedBot.ctrl.crashed = true;

				collection.splice(index, 1);

			}, 1000);
		} else {
				collection.splice(index, 1);
		};

		//switch flag to check if this bot crashed
		crashedBot.ctrl.crashed = true;
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

		var rect = new fabric.Rect(newUnit);
		rect.isNew = false;
		self.canvas.add(rect);

		setTimeout(function() {
			self.canvas.renderAll();
		}, 50);


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

	self.updateThisUnit = function(updateThis, destination) {
		$.each(self.canvas.getObjects(), function(key, value) {
			if (updateThis._id === value._id) {
				var temporObj = self.extendReqiredKeys(destination, updateThis);
				$.extend(true, value, temporObj);
			};
		});
	};

	self.resetNewObjects = function() {

		$.each(self.canvas.getObjects(), function(key, value) {
			if (value.isNew) {
				value.isNew = false;
			};
		});
	}

	self.extendReqiredKeys = function(destination, source) {

		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object && property in destination) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
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