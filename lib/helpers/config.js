var lbUtils = require('./utils');

var defaults = {
	"baseURL" : "http://localhost",
	"port" : 8888,
	"defaultRenderer" : "html",
	"routeMaps" : [
		{
		 	"path" : "/",
		 	"dest" : "/index"
	 	}
	],
	"routeHandlers" : [
		
	],
	"MIME_TYPES" : {
		"eot" : "application/vnd.ms-fontobject",
		"ttf" : "font/ttf",
		"otf" : "font/otf",
		"ico" : "image/x-icon",
		"css" : "text/css",
		"js"  : "application/x-javascript",
		"xml" : "application/xml"
	},
	"preControllerHooks" : [
		
	],
	"postControllerHooks" : [
	],
	"secureRoutes":[
		
	],
	"databaseName" : "streetsahead",
	"logAppenders" : [
		{
			"file" : "console",
			"level" : "trace"
		}
	],
	"templateCache" : 3600, // in seconds
	"templateTags" : {
		"start" : "<%",
		"end" : "%>"
	},
	"mobileEnabled" : false,
	"cookieSecret" : "", // used to encrypt the users session cookie
	"cookieTimeout" : 7200 // in minutes
};

var getConfig = function() {
	try {
		config = require(process.cwd() + '/config.js');
		
		options = lbUtils.extend(defaults, config);
		if(process.env.LB_BASE_URL) {
			options.baseURL = process.env.LB_BASE_URL;
		}
	} catch (e) {
		return defaults;	
	}

	return options;
};

exports.getConfig = getConfig;

