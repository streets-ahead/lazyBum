exports.extend = function(parent, child) {
	for(prop in parent) {
		if(!child.hasOwnProperty(prop)) {
			child[prop] = parent[prop];
		}
	}
	return child;
};

