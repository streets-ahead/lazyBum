var logger = require('./LBLogger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils'),
	config = require('./helpers/config'),
	input = require('./helpers/input');

var log = new logger(module);

var db = config.getConfig().databaseName;
var dbClient = mongo.createDbClient(db, 'localhost');
dbClient.connect();

var Collection = function(collection, schema){
	this.collection = collection;
	this.dbClient = dbClient;
	var collectionObj = this;
	this.presaveActions = [];
	
	//Constructor for "model objects"
	this.Model = function(obj) {
		collectionObj.Model.schema['_id'] = {type:'String'};
		for(var field in collectionObj.Model.schema) {
			var that = this;
			var type = collectionObj.Model.schema[field]['type'];
			var converter = input.typeConverters[type];
			
			this.dirty = true;
			this.persisted = false;
			this.errorMessage = "";

			if(!converter) {
				converter = function(obj) { return obj; };
			}
			this.addDefaultSettersAndGetters(field, converter);
			
			var defaultValue = collectionObj.Model.schema[field]['default'];
			// TODO: pretty f'n cloogy, need to make it better
			if(defaultValue || ((type === 'Int' || type === 'Float') && defaultValue === 0) || type === 'Bool') {
				this[field] = defaultValue;
			} 
		}
		
		// TODO: this should probably be better?
		if(obj) {
			for(var prop in obj) {
				this[prop] = obj[prop];
			}
		}
	};
	
	this.Model.schema = schema || {};
	
	this.Model.prototype = {
		save : function(callback) {
			var that = this;
			for(var i = 0; i < collectionObj.presaveActions.length; i++) {
				collectionObj.presaveActions[i].call(that);
			}
			
			if(this.validate()) {
				if(this.persisted) {
					collectionObj.update(that.getDataObj(), {'_id':mongo.getMongoId(that._id)}, function(results) {
						that.dirty = false;
						this.persisted = true;
						if(callback) {
							callback(results);
						}
					});
				} else {
					collectionObj.create(this, function(results) {
						that.dirty = false;
						that.persisted = true;
						callback(results);
					});
				}
				
			}
		},
		validate : function() {
			return input.validateObject(this, collectionObj.Model.schema);
		},
		getDataObj : function() {
			var dataObj = {};
			for(var prop in this) {
				if(this.hasOwnProperty(prop) && collectionObj.Model.schema.hasOwnProperty(prop) && prop !== '_id') {
					dataObj[prop] = this[prop];
				}
			}
			
			return dataObj;
		},
		addDefaultSettersAndGetters : function(property, converter) {
			var that = this;
			that.__defineGetter__(property, function() {
				return that['_' + property];
			});

			that.__defineSetter__(property, function(val) {
				that.dirty = true;
				that['_' + property	] = converter(val);
			});
		}
	};
}

Collection.prototype.addPreSaveAction = function(func){
	this.presaveActions.push(func);
}

Collection.prototype.removePreSaveAction = function(func){
	this.presaveActions.splice(this.presaveActions.indexOf(func), 1);
}

Collection.prototype.addErrorHanlder = function(handler) {
	this.dbClient.ahead.on('ERROR', handler);
};

Collection.prototype.removeErrorHandler = function(handler) {
	this.dbClient.ahead.removeListener('ERROR', handler);
}

Collection.prototype.objectsWithResultArray = function(done, results, callback) {
	var objs = [];

	for(var i = 0; i < results.length; i++) {
		objs[i] = new this.Model(results[i]);
		objs[i].dirty = false;
		objs[i].persisted = true;
	}

	if(callback) {	
		callback(objs); 
	}
	done(objs);
} 

Collection.prototype.findAll =  function(callback){
	var that = this;
	that.dbClient.find(this.collection, {}, null).next( function(done, results, err) {
		if(err) {
			log.error(err.stack);
		}
		that.objectsWithResultArray(done, results, callback);
	});

}

Collection.prototype.findOne = function(search, callback){
	var that = this;
	this.dbClient.find(this.collection, search, {limit: 1}).next( function(done, result, err) {
		if(err) {
			log.error(err.stack);
		}
		that.objectsWithResultArray(done, result, callback); 
	});
}

Collection.prototype.find = function(search, callback){
	var that = this;

	this.dbClient.find(this.collection, search, {}).next( function(done, result, err) {
		if(err) {
			log.error(err.stack);
		}
		that.objectsWithResultArray(done, result, callback); 
	});
}

Collection.prototype.update = function(obj, selector, callback) {
	var that = this;
	this.dbClient.update(this.collection, selector, obj).next(function(done, result, err) {
		log.trace('updating for selector ');
		log.trace(selector);
		if(err) {
			log.error(err.stack);
		}
		
		//that.objectsWithResultArray(done, result, callback); 
		if(callback) {
			callback(result)
		}
		done(result, err);
	});
}

Collection.prototype.create = function(obj, callback){
	var that = this;
	var doc = obj;
	if(!obj.getDataObj) {
		doc = new that.Model(obj);
	}

	this.dbClient.insert(that.collection, doc.getDataObj()).next(function(done, results, err) {
		if(err) {
			log.error(err.stack);
		}
		that.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.remove = function(selector, callback){
	var sel = selector || {}
	this.dbClient.remove(this.collection, sel).next(function(done, result, err) {
		if(err) {
			log.error(err.stack);
		}
		callback(result);
		done(result, err);
	});
}

Collection.prototype.nextOperation = function(operation) {
	this.dbClient.ahead.next(operation);
}

Collection.extend = lbUtils.createExtendable(Collection)
module.exports = Collection;
