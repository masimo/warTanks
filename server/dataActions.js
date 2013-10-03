var dataActions = {
	hostArray: function(hostCollection) {
		var array = [];

		hostCollection.map(function(value) {
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
	getId: function(callBack, hostCollection) {

		var _id = Math.random().toString(36).substring(2);

		for (var i = 0, len = hostCollection.length; i < len; i++) {
			if (_id == hostCollection[i].id) {
				arguments.callee();
			};
		};

		callBack(_id);

	},
	joinToHost: function(value, key) {


	}
};
exports.dataActions = dataActions;