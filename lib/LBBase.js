var EventEmitter = require('events').EventEmitter,
	lbLogger = require('lbLogger');

var log = new lbLogger(module);

var LBBase = function(reqData) {
	if(reqData) {	
		this.reqData = reqData;
	}
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

	return newExtendMethod;
};

// Make LBBase inherit from EventEmitter
var emitter = new EventEmitter();
LBBase.prototype = emitter;
LBBase.prototype.constructor = LBBase;

LBBase.prototype.setHeader = function(name, value) {
	log.info('setting header ' + name) + ' to ' + value;
	if(!this.reqData.headers) {
		this.reqData.headers = {};
	}
	this.reqData.headers[name] = value;
};

LBBase.prototype.getHeader = function(name) {
	return this.reqData.request.headers[name];	
};

LBBase.prototype.redirect = function(newURL) {
	log.trace('redirect');
	this.emit(LBBase.REDIRECT, this.reqData, newURL);
	this.emit(LBBase.LBEVENT, LBBase.REDIRECT, this.reqData, [newURL]);
};

LBBase.prototype.endResponse = function(data) {
	log.trace('fire endResponse event ');
	this.emit(LBBase.RESP_COMPLETE, this.reqData, data);
	this.emit(LBBase.LBEVENT, LBBase.RESP_COMPLETE, this.reqData, [data]);
};

LBBase.prototype.writeData = function(data) {
	log.trace('sending writeData');
	this.emit(LBBase.HAS_DATA, this.reqData, data);
	this.emit(LBBase.LBEVENT, LBBase.HAS_DATA, this.reqData, [data]);
};

LBBase.prototype.showNotFound = function(responseCode) {
	if(!responseCode) {
		responseCode = 404;
	}

	log.trace("sending not found");
	this.emit(LBBase.NOT_FOUND, this.reqData, [responseCode]);
	this.emit(LBBase.LBEVENT, LBBase.NOT_FOUND, this.reqData, [responseCode]);
}

LBBase.prototype.showError = function(errorMessage, responseCode) {
	if(!responseCode) {
		responseCode = 500;
	}

	log.trace("sending error event: " + errorMessage);
	this.emit(LBBase.ERROR, this.reqData, [responseCode, errorMessage]);
	this.emit(LBBase.LBEVENT, LBBase.ERROR, this.reqData, [responseCode, errorMessage]);
}

LBBase.prototype.addPrimaryListener = function(func) {
	this.addListener(LBBase.LBEVENT, func);
}

LBBase.extend = createExtend(LBBase);

LBBase.LBEVENT = 'lbevent';

LBBase.INIT_COMPLETE = "initComplete";
LBBase.ROUTING_COMPLETE = "routingComlete";
LBBase.PRECONTROLLER_COMPLETE = "preControllerComplete";
LBBase.CONTROLLER_COMPLETE = "controllerComplete";
LBBase.POSTCONTROLLER_COMPLETE = "postControllerComplete";
LBBase.FILE_FOUND = "fileFound";
LBBase.FILE_NOT_EXISTS = "fileNotExists";
LBBase.HAS_DATA = "hasData";
LBBase.RESP_COMPLETE = "respComplete";
LBBase.REDIRECT = "redirect";
LBBase.NOT_FOUND = "notFound";
LBBase.ERROR = "error";


module.exports = LBBase;

