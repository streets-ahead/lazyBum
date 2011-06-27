var logger = require('./LBLogger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils');

var log = new logger(module);

var Collection = function(collection){
	this.collection = collection;
	this.dbClient = mongo.getDbClient('testme', 'localhost');
	
}

Collection.prototype.all =  function(callback){
	this.dbClient.find(this.collection, {}, null).next( callback );
}

Collection.prototype.findOne = function(search, callback){
	this.dbClient.find(this.collection, search, {limit: 1}).next( callback );
}

Collection.prototype.find = function(search, callback){
	this.dbClient.find(this.collection, search, {}).next(callback);
}

Collection.prototype.create = function(doc, callback){
	var validated = this.validate(doc);
	if(!validated){
		var err = {
			message: "Missing Required Fields"
		};	
		callback(err)
	}else{
		if(callback){
			mongo.insertWithCallBack(this.collection, doc, callback);
		}else{
			mongo.insert(this.collection, doc);
		}
    //callback(null);
	}
	log.trace('IS VALID: ' + validated)
	
}

Collection.prototype.remove = function(selector, callback){
	var sel = selector || {}
	this.dbClient.remove(this.collection,sel).next(callback);
}

Collection.extend = lbUtils.createExtendable(Collection)
module.exports = Collection;
