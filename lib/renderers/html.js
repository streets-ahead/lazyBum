var Hobo = require('Hobo'),
	lbConfig = require('lbConfig'),
	Renderer = require('Renderer'),
	lbLogger = require('lbLogger');

var log = new lbLogger(module);

var html = Renderer.extend(function() {
	html.super_.apply(this, arguments);
});

module.exports = html;

html.prototype.render = function(data, templateName) {
	// have to do this so that we have the propper "this" in the inner callback
	var that = this;
	var globalConf = lb.getConfig();
	var userAgent = this.getHeader('user-agent'), 
		templatePath = null;
	log.debug('found user-agent ' + userAgent);
	if( globalConf.mobileEnabled && (userAgent.search(/android/i)>=0 || userAgent.search(/iPhone/i)>=0) ){
		log.trace("on mobile");
		templatePath = '/templates/mobile_templates/'
	}

	var sandbox = {
		"data" : data
	}	

	hobo = Hobo.getInstance();
	hobo.on('data', function(data) {
		that.writeData(data);
	});
	hobo.on('end', function() {
		that.endResponse();
	});

	hobo.render(templateName, sandbox, templatePath);

}; 

html.CONTENT_TYPE = "text/html";

