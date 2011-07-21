var mongo = require('../lib/helpers/mongo');

var client;

var mongoTest = function() {
	client = mongo.createDbClient('streetsahead', 'localhost');

	client.addErrorHandler('ERROR', function(e) {
		console.log('got error ' + e);
	})
	
	client.connect();
}

mongoTest.prototype.testInsert = function() {
		debugger;
	client.insert('myTable', {test:'stuff'}).next(function(done, docs){
		 done();
	}) 
}

mongoTest.prototype.done = function() {
	client.closeConnection().next(function() {
		console.log('close connection');
	});
}

var http = require('http');

// http.createServer(function(req, resp) {
// 	mt = new mongoTest();
// 	
// 	mt.testInsert();
// 	mt.done();
// }).listen(3333);




module.exports = mongoTest;
