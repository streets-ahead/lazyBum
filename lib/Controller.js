var LBBase = require('./LBBase.js'),
	logger = require('./LBLogger'),
	fs = require('fs');

var log = new logger(module);

var Controller = LBBase.extend(function() {
	Controller.super_.apply(this, arguments);
});

Controller.prototype.writeResponse = function(data, responseCode, template) {
	log.trace('sending writeResponse event');
	var sb = {};
	if(typeof this.helpers !== 'undefined') {
		for(var i = 0; i < this.helpers.length; i++) {
			sb[this.helpers[i]] = this[this.helpers[i]];
		}		
		log.debug("helpers ");
		log.debug(sb);
	}
	
	this.emit(LBBase.LBEVENT, LBBase.CONTROLLER_COMPLETE, this.reqData, [data, responseCode, sb, template]);
}

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

