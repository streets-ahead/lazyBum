var LBBase = require('./LBBase.js'),
	logger = require('./LBLogger'),
	fs = require('fs');

var log = new logger(module);

var Controller = LBBase.extend(function() {
	if(this.restfulCollection) {
		initRestful(this.restfulCollection);
	}
	Controller.super_.apply(this, arguments);
});

var initRestful = function(col) {
	Controller.prototype.index_put = function(urlParts, query, post) {
		
	}
	
	Controller.prototype.index_get = function(urlParts, query, post) {
		// if(urlParts)
	}
	
	Controller.prototype.index_post = function(urlParts, query, post) {
		
	}
	
	Controller.prototype.index_delete = function(urlParts, query, post) {
		
	}
}

Controller.prototype.bindInput = function(collection, obj) {
	var obj = collection.create(obj);
	var valid = obj.validate();
	
	if(valid) {
		return {valid : true, object : obj};
	} else {
		return {valid : false, object : obj.errors};
	}
};

Controller.prototype.writeResponse = function(data, template, responseCode) {
	if(!responseCode) {
		responseCode = 200;
	}
	
	log.trace('sending writeResponse event');
	var sb = {};
	if(typeof this.helpers !== 'undefined') {
		for(var i = 0; i < this.helpers.length; i++) {
			sb[this.helpers[i]] = this[this.helpers[i]];
		}		
		log.debug("helpers ");
	}
	
	this.emit(LBBase.LBEVENT, LBBase.CONTROLLER_COMPLETE, this.reqData, [data, responseCode, sb, template]);
};

Controller.prototype.urlPathToMap  = function(path) {
	var retObj = {};
	for(var i = 0; i < path.length; i+=2) {
		var key = path[i];
		var val = (i + 1) < path.length ? path[i + 1] : null;
		retObj[key] = val;
	}
	
	return retObj;
};


module.exports = Controller;

