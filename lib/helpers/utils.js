var EventEmitter = require('events').EventEmitter;

exports.extend = function(parent, child) {
	for(prop in parent) {
		if(!child.hasOwnProperty(prop)) {
			child[prop] = parent[prop];
		}
	}
	return child;
};

var createExtendable = function(superClass) {

	var newExtendMethod = function(subClass) {
		var F = function() {};
		
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;

		subClass.superclass = superClass.prototype;
		subClass.extend = createExtendable(subClass);

		if(superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}

		subClass.super_ = superClass.prototype.constructor
		
		return subClass;
	};

	for(var prop in EventEmitter.prototype) {
		superClass.prototype[prop] = EventEmitter.prototype[prop];
	}

	superClass.prototype.constructor = superClass;

	return newExtendMethod;
};

exports.createExtendable = createExtendable;
