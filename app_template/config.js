module.exports = {
	"baseURL" : "http://localhost",
	"port" : 8888,
	"defaultRenderer" : "html",
	"routeMaps" : [
		{
			"path" : "/",
			"dest" : "/home"
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
		{ 
		//	"hook": "authenticate",
		}
	],
	"postControllerHooks" : [
	],
	"secureRoutes":[
		{
			//"route" : "/article/new",
			//"methods" : ['get']
		}
	],
	"databaseName" : "streetsahead",
	"logAppenders" : [
		{
			"file" : "lb.log",
			"level" : "error"
		},
		{
			"file" : "access.log",
			"level" : "access"	
		},
		{
			"file" : "console",
			"level" : "info"
		}
	],
	"templateCache" : 3600, // in seconds
	"templateTags" : {
		"start" : "<%",
		"end" : "%>"
	},
	"mobileEnabled" : false
};
