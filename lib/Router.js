var LBBase = require('./LBBase.js'),
	lb = require('./helpers/config'),
	lbLogger = require('./helpers/logger');

var log = new lbLogger(module);

var Router = LBBase.extend(function() {
	
	Router.super_.apply(this, arguments);
});

Router.prototype.route = function(url) {
	var globalConfig = lb.getConfig();
	var routeMaps = globalConfig.routeMaps;

	for(var i = 0; i < routeMaps.length; i++) {
		var prePath = routeMaps[i].path;
		if(url.pathname === prePath) {
			log.debug('redirecting to ' + routeMaps[i].dest);
			url.pathname = routeMaps[i].dest;
		}
	}

	var routeHandlers = globalConfig.routeHandlers;
	for(var i = 0; i < routeHandlers.length; i++) {
		var handlerPath = routeHandlers[i].path;
		if(url.pathname == handlerPath) {
			routeHandlers[i].handler(this.reqData);
			return;
		}
	}

	this.finishRoute(url);
};

Router.prototype.finishRoute = function(url) {
	this.reqData.url = url;
	this.emit(LBBase.LBEVENT, LBBase.ROUTING_COMPLETE, this.reqData, [url]);
}

module.exports = Router;

