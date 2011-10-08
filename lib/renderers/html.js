var Hobo = require('../Hobo'),
	Renderer = require('../Renderer'),
	lbConfig = require('../helpers/config'),
	lbLogger = require('../LBLogger');

var log = new lbLogger(module);

var html = Renderer.extend(function() {
	html.super_.apply(this, arguments);
});

module.exports = html;

html.prototype.render = function(data, sandbox, templateName, ref) {
	// have to do this so that we have the propper "this" in the inner callback
	var that = ref || this;
	var globalConf = lbConfig.getConfig();
	//var userAgent = this.getHeader('user-agent'), 
	var	templatePath = globalConf.templateDir + '/';
  
  log.warn(templatePath.toUpperCase());
	// TODO: support mobile, removing for now.
	// log.debug('found user-agent ' + userAgent);
	// if( globalConf.mobileEnabled && (userAgent.search(/android/i)>=0 || userAgent.search(/iPhone/i)>=0) ){
	// 	log.trace("on mobile");
	// 	templatePath = '/templates/mobile_templates/'
	// }

	hobo = new Hobo();
	hobo.on('data', function(data) {
		that.writeData(data);
	});
	hobo.on('end', function() {
		that.endResponse();
	});

	sandbox.data = data;
	hobo.render(templateName, sandbox, process.cwd() + templatePath);
	hobo = null;
}; 

html.CONTENT_TYPE = "text/html";

