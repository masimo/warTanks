'use strict';

app.controller('playRoomController', function NormalModeController($scope, $filter) {

	var gamePlay = new Game();
	var objCollection = {
		clients: [],
		bots: []
	}

	//Asign data to game constructor
	gamePlay.setCollection(objCollection);


	function hostCreate() {

		var canvas = gamePlay.getCanvas();

		gamePlay.initObj(function(client) {

			objCollection.clients.push(client);

		});

		for (var i = 0, len = 3; i < len; i++) {

			gamePlay.botAdd(function(bot) {

				objCollection.bots.push(bot);

				gamePlay.botEngin(bot);

			});
		};



	};



	hostCreate();



});