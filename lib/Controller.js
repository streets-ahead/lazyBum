var LBBase = require('./LBBase.js'),
	logger = require('./helpers/logger');

var log = new logger(module);

var Controller = LBBase.extend(function() {
	Controller.super_.apply(this, arguments);
});

Controller.prototype.writeResponse = function(data, responseCode, template) {
	log.trace('sending writeResponse event');
	this.emit(LBBase.LBEVENT, LBBase.CONTROLLER_COMPLETE, this.reqData, [data, responseCode, template]);
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

