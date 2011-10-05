var LBBase = require('./LBBase'),
	logger = require('./LBLogger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils'),
	config = require('./helpers/config'),
	input = require('./helpers/input'),
	Ahead = require('./helpers/ahead');

var log = new logger(module);

var db = config.getConfig().databaseName;
var dbServer = config.getConfig().dbServer;
var dbClient = mongo.createDbClient(db, dbServer);
dbClient.connect();

var Collection = LBBase.extend( function(collection, schema, reqData) {
	// collections can't have collections
	Collection.prototype.collections = undefined;
	Collection.super_.apply(this, [reqData]);
	
	this.collection = collection;
	this.dbClient = dbClient;
	var collectionObj = this;
	this.presaveActions = [];
	
	var self = this;
	
	//Constructor for "model objects"
	this.Model = function(obj) {
		collectionObj.Model.schema['_id'] = {type:'String'};
		collectionObj.Model.schema['createdDate'] = {type:'Date'};
		collectionObj.Model.schema['modifiedDate'] = {type:'Date'};
		for(var field in collectionObj.Model.schema) {
			var self = this;
			var type = collectionObj.Model.schema[field]['type'];
			var converter = input.typeConverters[type];
			
			this.dirty = true;
			this.persisted = false;
			this.errors = [];

			if(!converter) {
				converter = function(val) { return val; };
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
	
	var insert = function(obj, callback) {
		self.dbClient.insert(self.collection, obj.getDataObj()).next(function(done, results, err) {
			if(err) {
				log.error(err.stack);
			}
			self.objectsWithResultArray(err, done, results, callback); 
		});
	}
	
	this.Model.schema = schema || {};
	
	this.Model.prototype = {
		save : function(callback) {
			var self = this;
			for(var i = 0; i < collectionObj.presaveActions.length; i++) {
				collectionObj.presaveActions[i].call(self);
			}
			
			if(!callback) { callback = function(){} };
			
			self.fullValidate(function(valid) {
				if(valid) {
					if(self.persisted) {
						log.trace("UPDATING OBJECT")
						if(self.dirty) {
							self.modifiedDate = new Date();
							collectionObj.update(self.getDataObj(), {'_id':mongo.getMongoId(self._id)}, function(results) {
								self.dirty = false;
								self.persisted = true;
								if(callback) {
									callback(results, null);
								}
							});
						}
					} else {
						self.modifiedDate = new Date();
						self.createdDate = new Date();
						insert(self, function(results) {
							self.dirty = false;
							self.persisted = true;
							if(callback) {
								callback(results, null);
							}
						});
					}
				} else {
					log.error(self.errors);
					callback(null, self.errors);
				}
			});
		},
		fullValidate : function(callback) {
			var self = this;
			if(this.validate()) {
				log.trace('valid');
				var sc = collectionObj.Model.schema;
				var ah = new Ahead();
				ah.next(function(done) {done(true)});
				for(field in sc) {
					fieldDesc = sc[field];
					log.trace(field);

					if(fieldDesc['unique'] && fieldDesc['unique'] === true) {
						(function(fieldName) {
							ah.next(function(done, arg, err) {
								collectionObj.isUnique(self, fieldName, function(isUnique) {
									if(!isUnique) {
										self.addError(fieldName + '.notUnique');
									}
									done(arg && isUnique);
								})
							});
						}) (field);
					}
				}
				ah.next(function(done, arg, err) {
					callback(arg);
					if(arg) {
						self.clearErrors();
					}
					done(arg);
				});
			} else {
				callback(false);
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
			var self = this;
			self.__defineGetter__(property, function() {
				return self['_' + property];
			});

			self.__defineSetter__(property, function(val) {
				self.dirty = true;
				self['_' + property	] = converter(val);
			});
		},
		addError : function(err) {
			this.errors.push(err);
		},
		clearErrors : function() {
			this.errors = [];
		}
	};
});

Collection.prototype.overrideFieldSetter = function(field, setter) {
	this.Model.prototype.__defineSetter__(field, setter);
}

Collection.prototype.overrideFieldGetter = function(field, getter) {
	this.Model.prototype.__defineGetter__(field, getter);
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

Collection.prototype.objectsWithResultArray = function(error, done, results, callback) {
	var objs = [];

	for(var i = 0; i < results.length; i++) {
		objs[i] = new this.Model(results[i]);
		objs[i].dirty = false;
		objs[i].persisted = true;
	}

	if(callback) {	
		callback(objs, error); 
	}
	done(objs, error);
} 

Collection.prototype.findAll =  function(callback){
	var self = this;
	self.dbClient.find(this.collection, {}, null).next( function(done, results, err) {
		if(err) {
			log.error(err.stack);
		}
		self.objectsWithResultArray(err, done, results, callback);
	});

}

Collection.prototype.findOne = function(search, callback){
	var self = this;
	this.dbClient.find(this.collection, search, {limit: 1}).next( function(done, result, err) {
		var resultObj;
		if(err) {
			log.error(err.stack);
		} else if(result.length === 1){
			resultObj = new self.Model(result[0]);
			resultObj.dirty = false;
			resultObj.persisted = true;
		}
    else{
      log.error(result)
    }
		
		if(callback) {
			callback(resultObj, err);
		}
		
		done(resultObj, err);
	});
}

Collection.prototype.find = function(search, callback){
	var self = this;

	this.dbClient.find(this.collection, search, {}).next( function(done, result, err) {
		if(err) {
			log.error(err.stack);
		}
		self.objectsWithResultArray(err, done, result, callback); 
	});
}

Collection.prototype.isUnique = function(obj, field, callback) {
 	qry = {};
	qry[field] = obj[field];
	this.dbClient.find(this.collection, qry, {}).next(function(done, result, err) {
		if(err) {
			log.error(err.stack);
		}
		
		var isUnique=false;
		
		if(result.length === 0){ isUnique = true; }
		else{
			if(result.length === 1 && result[0]._id==obj._id){ // don't choke on self
				isUnique = true;
			}
		}
		
		callback(isUnique, err);		
		done(result, err);
	});
}

Collection.prototype.update = function(obj, selector, callback) {
	var self = this;
	this.dbClient.update(this.collection, selector, obj).next(function(done, result, err) {
		log.trace('updating for selector ');
		log.trace(selector);
		if(err) {
			log.error(err.stack);
		}
		
		//self.objectsWithResultArray(done, result, callback); 
		if(callback) {
			callback(result, err)
		}
		done(result, err);
	});
}

Collection.prototype.create = function(obj, callback){
	return new this.Model(obj);
}

Collection.prototype.remove = function(selector, callback){
	var sel = selector || {}
	this.dbClient.remove(this.collection, sel).next(function(done, result, err) {
		if(err) {
			log.error(err.stack);
		}
		callback(result, err);
		done(result, err);
	});
}

Collection.prototype.nextOperation = function(operation) {
	this.dbClient.ahead.next(operation);
}

Collection.extend = lbUtils.createExtendable(Collection)
module.exports = Collection;
