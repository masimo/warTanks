"use strict"

function botEngin(curentBut, canvas) {

	var self = this;

	//Random angles
	self.rdAngArr = [0, 90, 180, 270];

	self.canvas = canvas;

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
			// self.shoot(curentBut);
		};

		if (angle === 0 || angle === 180) {

			//Calculate top position of obj
			top = angle < 180 ? top - ctrl.speed : top + ctrl.speed;

			/*		var collide = self.checkCollision(left, top, curentBut);

				if (!collide && ctrl.appearMode) {
					ctrl.appearMode = false;
				}

				if (collide && !ctrl.appearMode) {
					top = topOld;
					angle = self.rdAng(angle);
				};*/

		} else {

			//Calculate left position of obj
			left = angle < 180 ? left + ctrl.speed : left - ctrl.speed;

			/*var collide = self.checkCollision(left, top, curentBut);

				if (!collide && ctrl.appearMode) {
					ctrl.appearMode = false;
				}

				if (collide && !ctrl.appearMode) {
					left = leftOld;
					angle = self.rdAng(angle);
				};*/

		}

		bot.set({
			top: top,
			left: left,
			angle: angle
		});

		self.canvas.renderAll();

	}, ctrl.fps);



	//Random value from array
	self.rdAng = function(not) {

		var self = this;

		// Get array of posible angles
		var arr = self.rdAngArr.slice(0);

		// Cut undesirable value from array (angle)
		if (not != undefined) {

			for (var i in arr) {
				if (arr[i] === not) {
					arr.splice(i, 1);
				}
			}
		};

		//Return random value (angle)
		return arr.sort(function() {
			return Math.random() > 0.5
		})[0];
	};


}
