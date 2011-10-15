var LBBase = require('./LBBase.js'),
	config = require('./helpers/config'),
	lbLogger = require('./LBLogger');

var log = new lbLogger(module);

var Router = LBBase.extend(function(reqData) {
	Router.super_.apply(this, arguments);
});

Router.prototype.route = function(url) {
	var globalConfig = config.getConfig();
	var routeMaps = globalConfig.routeMaps;
	
	for(var i = routeMaps.length-1; i > -1 ; i--) {
		var prePath = '^' + routeMaps[i].path + '$';
		var parts = url.pathname.match(prePath);
		var insertions = routeMaps[i].dest.match(/(\$[0-9]{1,3})/g);

		if(parts !== null) {
			var newUrl = routeMaps[i].dest;
			for(var j = 0; insertions && j < insertions.length; j++) {
				var insertionPos = insertions[j].substring(1);
				newUrl = newUrl.replace(insertions[j], parts[insertionPos]);
			}
			log.trace('redirecting to ' + newUrl);
			url.pathname = newUrl;
			break;
		}
	}

	this.finishRoute(url);
	return url;
};

Router.prototype.finishRoute = function(url) {
	this.reqData.url = url;
	this.emit(LBBase.LBEVENT, LBBase.ROUTING_COMPLETE, this.reqData, [url]);
};

module.exports = Router;

