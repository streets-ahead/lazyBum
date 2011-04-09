var config = require('../config.js'),
	lbUtils = require('lbUtils');

var defaults = {
	"baseURL" : "http://localhost:8888/",
	"port" : "8888",
	"defaultHTMLTemplate" : "default",
	"defaultRenderer" : "html",
	"routeMaps" : [
		{
			"path" : "/",
			"dest" : "/index.html"
		}
	],
	"routeHandlers" : [
		
	],
	"MIME_TYPES" : {
		"eot" : "application/vnd.ms-fontobject",
		"ttf" : "font/ttf",
		"otf" : "font/otf",
		"ico" : "image/x-icon"
	},
	"preControllerHooks" : [
		"authenticate"
	],
	"postControllerHooks" : [
	],
	"secureRoutes":[
		{
			"route" : "/article/new",
			"methods" : ['get']
		}

	],
	"databaseName" : "streetsahead",
	"logAppenders" : [
		{
			"file" : "lb.log",
			"level" : "info"
		},
		{
			"file" : "access.log",
			"level" : "access"	
		},
		{
			"file" : "console",
			"level" : "trace"
		}
	],
	"templateCacheTime" : 3600, // in seconds
	"templateTags" : {
		"start" : "<%",
		"end" : "%>"
	},
	"publicDir" : "/public/"
};

var getConfig = function() {
	options = lbUtils.extend(defaults, config);
	if(process.env.LB_BASE_URL) {
		options.baseURL = process.env.LB_BASE_URL;
	}

	return options;
};

exports.getConfig = getConfig;

