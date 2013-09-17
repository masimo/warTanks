function BotEngin(bot, canvas, bots, clients) {
	var self = this;

	//Curent bot 
	self.bot = bot.bot;
	self.ctrl = bot.ctrl;

	//Global objects using for colision
	self.clients = clients;
	self.bots = bots;

	var canvWidth = canvas.width,
		canvHeight = canvas.height;

	//Random angles
	self.rdAngArr = [0, 90, 180, 270];

	botGo = setInterval(function() {

		// Chosse direction
		var direc = Math.random();


		var objHeight = self.bot.getHeight();

		//all about position
		var left = self.bot.getLeft(),
			top = self.bot.getTop(),
			angle = self.bot.getAngle(),
			leftOld = left,
			topOld = top;

		//choose shoot or not
		var shoot = Math.random();

		// if true get new angle
		if (0.97 < direc && direc < 1) {
			angle = self.rdAng();
		};

		//if true then shoot!
		if (shoot > 0.75) {
			//
		};

		if (angle === 0 || angle === 180) {

			//Calculate top position of obj
			top = angle < 180 ? top - self.ctrl.speed : top + self.ctrl.speed;

			if (self.checkCollision(top)) {
				top = topOld;
				angle = self.rdAng(angle);

			};
		} else {

			//Calculate left position of obj
			left = angle < 180 ? left + self.ctrl.speed : left - self.ctrl.speed;

			if (self.checkCollision(left)) {
				left = leftOld;
				angle = self.rdAng(angle);

			};
		}

		self.bot.set({
			top: top,
			left: left,
			angle: angle
		});

		canvas.renderAll();

	}, self.ctrl.fps);

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

	//Check for collision
	self.checkCollision = function(newPos) {
		var collision = false;

		var objHeight = self.bot.getHeight();


		if (newPos + objHeight / 2 >= canvHeight || 0 > newPos - objHeight / 2 ||
			newPos + objHeight / 2 >= canvWidth) {

			collision = true;
		}

		self.bots.forEach(function(value) {

			if (self.bot === value.bot) {return false};

			var left = value.bot.getLeft(),
				top = value.bot.getTop(),
				angle = value.bot.getAngle(),
				width = value.bot.getWidth(),
				height = value.bot.getHeight();

			if (angle === 180 || angle === 0) {
				if (top - height / 2 < newPos && newPos < top + height / 2) {
					collision = true;
				};

			} else if (angle === 270 || angle === 90) {

				if (left - height / 2 < newPos && newPos < top + height / 2) {
					collision = true;
				};

			};

		});

		return collision;

	}


}