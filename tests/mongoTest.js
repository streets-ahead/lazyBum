var mongo = require('../lib/helpers/mongo');

var client = mongo.createDbClient('streetsahead', 'localhost');

client.connect();

client.insert('myTable', {'something':'test2'});

client.find('myTable', {}).next(function(done, results) {
	console.log(results);
	done();
});

//client.remove('myTable', {});

client.closeConnection();
