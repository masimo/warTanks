var DataActions = function(collection) {
	var _self = this;

	_self.gameData = collection;

	_self.hostArray = function() {

		var array = [];

		_self.gameData.hostCollection.map(function(value) {
			console.log(value.disabled);

			if (value.disabled) return false;
			array.push({
				id: value.id,
				hostIndex: value.hostIndex,
				secureType: value.secureType,
				name: value.name,
				type: value.type,
			});
		});

		return array;
	},
	_self.getId = function(callBack) {

		var _id = Math.random().toString(36).substring(2);

		for (var i = 0, len = _self.gameData.hostCollection.length; i < len; i++) {
			if (_id == _self.gameData.hostCollection[i].id) {
				arguments.callee();
			};
		};

		callBack(_id);

	},
	_self.joinToHost = function(value, key) {


	}
};

exports.DataActions = DataActions;