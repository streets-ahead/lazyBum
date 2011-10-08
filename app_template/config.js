module.exports = {
	"baseURL" : "http://localhost",
	"port" : 8888,
	"routeMaps" : [
		{
		 	"path" : "/",
		 	"dest" : "/index"
	 	}
	],
	"preControllerHooks" : [
		// "authenticate"
	],
	"postControllerHooks" : [
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
			"level" : "trace"
		}
	]
};
