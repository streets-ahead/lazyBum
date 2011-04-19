var EventEmitter = require('events').EventEmitter;

exports.extend = function(parent, child) {
	for(prop in parent) {
		if(!child.hasOwnProperty(prop)) {
			child[prop] = parent[prop];
		}
	}
	return child;
};

var createExtend = function(superClass) {

	var newExtendMethod = function(subClass) {
		var F = function() {};
		
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;

		subClass.superclass = superClass.prototype;
		subClass.extend = createExtend(subClass);

		if(superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}

		subClass.super_ = superClass.prototype.constructor
		
		return subClass;
	};

	var emitter = new EventEmitter();
	superClass.prototype = emitter;
	superClass.prototype.constructor = superClass;


	return newExtendMethod;
};

exports.createExtend = createExtend
