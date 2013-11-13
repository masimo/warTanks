var DataActions = function() {
	var self = this;

	var _ = require('lodash-node');

	self.gameData = [];

	self.hostArray = function() {

		var array = [];

		_(self.gameData.hostCollection).map(function(value) {

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
	};
	self.clientsCount = function(_id) {
		var count = 0;

		if (_id in self.gameData.hostCollection) {
			return self.gameData.hostCollection[_id].clients.length;
		}
	};
	self.getId = function() {

		var _id = Math.random().toString(36).substring(2);

		if (_id in self.gameData.hostCollection) {
			arguments.callee();
		}

		return _id;
	};
};

exports.DataActions = DataActions;