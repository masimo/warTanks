var DataActions = function() {
	var self = this;

	self.gameData = [];

	self.hostArray = function() {

		var array = [];

		self.gameData.hostCollection.map(function(value) {
			
			if (value.disabled === false) {

				array.push({
					id: value.id,
					hostIndex: value.hostIndex,
					secureType: value.secureType,
					name: value.name,
					hostName: value.hostName,
					type: value.type,
				});
			}
		});

		return array;
	},
	self.clientsCount = function(_id) {
		var count = 0;

		self.gameData.hostCollection.map(function(value) {
			if (_id === value.id) {
				count = value.clients.length;
			};
		});
		return count;
	},
	self.getId = function(callBack) {

		var _id = Math.random().toString(36).substring(2);

		for (var i = 0, len = self.gameData.hostCollection.length; i < len; i++) {
			if (_id == self.gameData.hostCollection[i].id) {
				arguments.callee();
			};
		};

		callBack(_id);

	},
	self.joinToHost = function(value, key) {


	}
};

exports.DataActions = DataActions;