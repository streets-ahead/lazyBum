var mongo = require('../lib/helpers/mongo');
// 
// var client = mongo.createDbClient('streetsahead', 'localhost');
// 
// client.connect();
// 
// client.insert('myTable', {'something':'test2'});
// 
// client.find('myTable', {}).next(function(done, results) {
// 	console.log(results);
// 	done();
// });
// 
// //client.remove('myTable', {});
// 
// client.closeConnection();

var client;

var mongoTest = function() {
	client = mongo.createDbClient('streetsahead', 'localhost');
	
	client.connect();
}

mongoTest.prototype.testInsert = function() {
	client.insert('myTable', {test:'stuff'}).next(function(done, docs){

		console.log('inserted stuff ');
		console.log(docs)
		 throw 'test'
		 // done();
	}).next(function(done) {
		console.log('testka;sdkfas')
		done();
	}) 
}

mongoTest.prototype.done = function() {
	client.closeConnection();
}


module.exports = mongoTest;
