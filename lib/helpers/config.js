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
	"MIME_TYPES" : {
		"eot" : "application/vnd.ms-fontobject",
		"ttf" : "font/ttf",
		"otf" : "font/otf",
		"ico" : "image/x-icon",
		"css" : "text/css",
		"js"  : "application/javascript",
		"xml" : "application/xml",
		'txt' : 'text/plain',
		'csv' : 'text/csv',
		'gif' : 'image/gif',
		'jpg' : 'image/jpeg',
		'jpeg' : 'image/jpeg',
		'png' : 'image/png',
		'tiff': 'image/tiff',
		'pdf' : 'application/pdf'
	},
	"preControllerHooks" : [
		
	],
	"postControllerHooks" : [
	],
	"secureRoutes":[
		
	],
	"databaseName" : "streetsahead",
	"databaseServer" : "localhost",
	"logAppenders" : [
		{
			"file" : "console",
			"level" : "debug"
		}
	],
	"templateCache" : 3600, // in seconds
	"templateTags" : {
		"start" : "<%",
		"end" : "%>"
	},
  "templateDir" : "/views",
	"mobileEnabled" : false,
	"sessionsEnabled" : true,
	"sessionTimeout" : 10080, // in minutes
	"cookieKey" : "chocolateChip" // this key is used to encrypt the cookies, it should be secure
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

