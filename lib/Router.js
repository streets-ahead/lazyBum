var LBBase = require('./LBBase.js'),
	lb = require('./helpers/config'),
	lbLogger = require('./LBLogger');

var log = new lbLogger(module);

var Router = LBBase.extend(function() {
	Router.super_.apply(this, arguments);
});

Router.prototype.route = function(url) {
	var globalConfig = lb.getConfig();
	var routeMaps = globalConfig.routeMaps;

	for(var i = 0; i < routeMaps.length; i++) {
		var prePath = routeMaps[i].path;
		if(prePath.match(url.pathname) !== null) {
			log.trace('redirecting to ' + routeMaps[i].dest);
			url.pathname = routeMaps[i].dest;
		}
	}

	this.finishRoute(url);
};

Router.prototype.finishRoute = function(url) {
	this.reqData.url = url;
	this.emit(LBBase.LBEVENT, LBBase.ROUTING_COMPLETE, this.reqData, [url]);
}

module.exports = Router;

