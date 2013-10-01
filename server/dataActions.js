var dataActions = {
	hostArray: function(hostCollection) {
		var array = [];

		hostCollection.map(function(value) {
			array.push({
				id: value.id,
				hostIndex: value.hostIndex,
				name: value.name,
				type: value.type,
			});
		});

		return array;
	},
	joinToHost: function(hostCollection) {

		hostCollection.forEach(function(value, key) {

			if (req.body.id === value.id &&
				req.body.secure === value.secure) {

				value.clients.push({
					nickName: req.body.nickName,
					'connection': {},
					hostIndex: key
				});
			}

		});
	}
};
exports.dataActions = dataActions;