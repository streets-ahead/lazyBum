require.paths.unshift(process.cwd() + "/lib");
var lazybum = require('lazybum'),
	ts = require('twitterSearch'),
	dbhelper = require('dbhelper');;

var server = new lazybum.RestServer();
server.startServer();

	
setInterval(function(){
	dbhelper.removeAll('tweets', function(){
		ts.query('StreetsAheadLLC');
		ts.query('tkeeney');
		ts.query('sammussell');
	})
}, 600000);

