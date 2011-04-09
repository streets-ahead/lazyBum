require.paths.unshift(process.cwd() + "/lib");
var assert = require('assert'),
	controller = require('Controller.js'),
	events = require(process.cwd() + '/controllers/events.js'),
	strutils = require('stringUtils'),
	LBBase = require('LBBase'),
	fserv = require('FileServer.js');



//console.log(events);

var fs = new fserv();
console.log(fs.setHeader);

var eventsObj = new events({"blah":"thing"});
console.log(eventsObj.request);
//console.log(eventsObj.constructor);

var NewClass = events.extend(function(args){

	NewClass.super_.call(this, args);

});


//console.log();
 //console.log(NewClass);

