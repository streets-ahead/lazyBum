var mongo = require('mongodb'),
	lbLogger = require('../LBLogger'),
	Ahead = require('./ahead');

var log = new lbLogger(module);

exports.createDbClient = function(dbName, host, port) {
	function DBClient(dbName, host, port) {
		port = port || mongo.Connection.DEFAULT_PORT;
		this.db = new mongo.Db(dbName, new mongo.Server(host, port, {}), {});
		this.client = null;
		this.errorMsg = null;
		this.error = false;
		this.ahead = new Ahead();
	}
	
	DBClient.prototype.connect = function() {
		var that = this;
		this.ahead.next(function(done) {
			that.db.open(function(err, client) {				
				that.client = client;
				done();				
			})
		});
		
		return this.ahead;
	};
	
	DBClient.prototype.closeConnection = function() {
		var that = this;
		return this.ahead.next(function(done) {
			that.client.close();
			done();
		});
	}
	
	DBClient.prototype.getCollection = function(table) {
		var that = this;
		return this.ahead.next( function(done) {
			that.client.collection(table, function(err, collection) { 
				done(collection); 
			});
		})
	}
	
	DBClient.prototype.insert = function(table, doc) {
	return this.getCollection(table).next(function(done, collection) {
			collection.insert(doc, function(err, docs) {
				done(docs);
			});
		});
	}
	
	DBClient.prototype.find = function(table, search, options) {
		var opt = options || {};
		
		return this.getCollection(table).next(function(done, collection) {
			collection.find(search, opt, function(err, cursor){
				done(cursor);
			})
		}).next(function(done, cursor) {
			cursor.toArray(function(err, results) {
				done(results);
			})
		})
	}
	
	DBClient.prototype.update = function(table, selector, update) {
		return this.getCollection(table).next(function(done, collection) {
			collection.update(selector, update, {upsert:true, multi:false}, function(err, result){
				done(result)
			})
		});		
	}
	
	DBClient.prototype.mapReduce = function(table, map, reduce, options) {
		return this.getCollection(table).next(function(done, collection) {
			collection.mapReduce(map, reduce, options, function(err, result){
		      	done(result)
		    });
		});
	}
	
	DBClient.prototype.distinct = function(collection, key) {
		var that = this;
		return this.ahead.next(function(done) {
			that.client.executeDbCommand({distinct: collection, key: key}, function(err, dbres){
				done(dbres.documents[0].values)
			})
		})
	}
	
	DBClient.prototype.remove = function(table, selector) {
		return this.getCollection(table).next(function(done, collection) {
			collection.remove(selector, function(err, result){
				done(result)
			})
		});
	}
	
	DBClient.prototype.removeAll = function(table) {
		return this.getCollection(table).next(function(done, collection) {
			collection.remove(function(err, result){
				done(result)
			})
		});
	}
	
	return new DBClient(dbName, host, port);
}



