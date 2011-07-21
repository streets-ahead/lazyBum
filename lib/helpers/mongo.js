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
	
	DBClient.prototype.addErrorHanlder = function(handler) {
		this.ahead.on('ERROR', handler);
	};
	
	DBClient.prototype.removeErrorHandler = function(handler) {
		this.ahead.removeListener('ERROR', handler);
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
				console.log(err);
				done(collection, err); 
			});
		})
	}
	
	DBClient.prototype.insert = function(table, doc) {
		return this.getCollection(table).next(function(done, collection) {
			collection.insert(doc, function(err, docs) {
				console.log('tehre ' + err)
				done(docs, err);
			});
		});
	}
	
	DBClient.prototype.find = function(table, search, options) {
		var opt = options || {};
		
		return this.getCollection(table).next(function(done, collection) {
			collection.find(search, opt, function(err, cursor){
				done(cursor, err);
			})
		}).next(function(done, cursor) {
			cursor.toArray(function(err, results) {
				done(results, err);
			})
		})
	}
	
	DBClient.prototype.update = function(table, selector, update) {
		return this.getCollection(table).next(function(done, collection) {
			collection.update(selector, update, {upsert:true, multi:false}, function(err, result){
				done(result, err)
			})
		});		
	}
	
	DBClient.prototype.mapReduce = function(table, map, reduce, options) {
		return this.getCollection(table).next(function(done, collection) {
			collection.mapReduce(map, reduce, options, function(err, result){
		      	done(result, err)
		    });
		});
	}
	
	DBClient.prototype.distinct = function(collection, key) {
		var that = this;
		return this.ahead.next(function(done) {
			that.client.executeDbCommand({distinct: collection, key: key}, function(err, dbres){
				done(dbres.documents[0].values, err)
			})
		})
	}
	
	DBClient.prototype.remove = function(table, selector) {
		return this.getCollection(table).next(function(done, collection) {
			collection.remove(selector, function(err, result){
				done(result, err)
			})
		});
	}
	
	DBClient.prototype.removeAll = function(table) {
		return this.getCollection(table).next(function(done, collection) {
			collection.remove(function(err, result){
				done(result, err)
			})
		});
	}
	
	return new DBClient(dbName, host, port);
}



