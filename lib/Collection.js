var logger = require('./LBLogger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils'),
	check = require('validator').check,
	sanitize = require('validator').sanitize,
	config = require('./helpers/config');

var log = new logger(module);

var db = config.getConfig().databaseName;
var dbClient = mongo.createDbClient(db, 'localhost');
dbClient.connect();

var Collection = function(collection, schema){
	this.collection = collection;
	var db = config.getConfig().databaseName;
	dbClient = mongo.createDbClient(db, 'localhost');
	dbClient.connect();

	var collectionObj = this;	
	
	//Constructor for "schema objects"
	this.schema = function(obj) {
		for(var field in collectionObj.schema.model) {
			var that = this;
			var type = collectionObj.schema.model[field]['type'];
			var converter = collectionObj.typeConverters[type];

			if(!converter) {
				converter = function(obj) { return obj; };
			}
			this.addDefaultSettersAndGetters(field, converter);
			
			var defaultValue = collectionObj.schema.model[field]['default'];
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
	
	this.schema.model = schema || {};
	
	this.schema.prototype = {
		save : function(callback) {
			if(this.validate()) {
				collectionObj.update(this, callback);
			}
		},
		
		// Gonna be bad for the first pass, fair warning
		// TODO: not tested, might work
		validate : function() {
			var valid = true
			for(var field in this.schema.model) {
				for(var contraint in this.schema.model) {
					var validator = collectionObj.contraintValidators[constraint];
					if(validator) {
						valid = validator(collectionObj.schema.model[validator], this[field]);
					}
				}
			}
			
			return valid;
		},
		addDefaultSettersAndGetters : function(property, converter) {
			that = this;
			this.__defineGetter__(property, function() {
				return that['_' + property];
			});

			that.__defineSetter__(property, function(val) {
					that['_' + property	] = converter(val);
			});
		}
	};
	
	
}

// TODO: add type converters for each supported type
Collection.prototype.typeConverters = {
	String : function(obj) {
		return obj.toString();
	},
	'Int' : function(obj) {
		return sanitize(obj).toInt();
	},
	'Float' : function(obj) {
		return sanitize(obj).toFloat();
	},
	'Date' : function(obj) {
		if(typeof obj === 'string') {
			return new Date(obj);
		} else {
			return obj;
		}
	},
	'Bool' : function(obj) {
		return sanitize(obj).toBoolean();
	}
}

// TODO: may be worth breaking this out into another class
Collection.prototype.contraintValidators = {
	type : function(val, obj) {
		var valid = true;
		switch(val) {
			case 'String':
				valid = typeof(obj) === 'string';
			  	break;
			case 'Int':
 				valid = check(obj).isInt();
			  	break;
			case 'Float':
				valid = check(obj).isFloat();
			  	break;
			case 'Array':
				valid = typeof(obj) === 'object' && (obj instanceof Array);
			  	break;
			case 'Object':
			  	valid = typeof(obj) === 'object';
				break;
			case 'Bool':
				valid = typeof(obj) === 'boolean';
				break;
			case 'Date':
				valid = typeof(obj) === 'object' && (obj instanceof Date);
				break;
			default:
				log.error('Invalid type value in schema model ' + val);
				valid = false;
		}
		
		return valid;
	},
	length : function(val, obj) {
		// TODO: support only max or only min
		return check(obj).len(val.min, val.max);
	},
	validateEmail : function(val, obj) {
		if(val) {
			return check(obj).isEmail();
		} else {
			return true;
		}
	},
	empty : function(val, obj) {
		if(val) {
			return check(obj).notEmpty();
		} else {
			return true;
		}
	},
	regex : function(val, obj) {
		// TODO: implement
	}
	
}

Collection.prototype.objectsWithResultArray = function(done, results, callback) {
	var objs = [];
	for(var i = 0; i < results.length; i++) {
		objs[i] = new that.schema(results[i]);
	}
	
	if(callback) {	
		callback(objs); 
	}
	
	done(objs);
} 

Collection.prototype.findAll =  function(callback){
	var that = this;
	dbClient.find(this.collection, {}, null).next( function(done, results) {
		this.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.findOne = function(search, callback){
	var that = this;
	dbClient.find(this.collection, search, {limit: 1}).next( function(done, result) {
		this.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.find = function(search, callback){
	var that = this;
	dbClient.find(this.collection, search, {}).next( function(done, result) {
		this.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.update = function(obj, callback) {
	dbClient.update(this.collection).next(function(done, result) {
		this.objectsWithResultArray(done, results, callback); 
	});
}


// TODO: make sure this returns the created object!
Collection.prototype.create = function(doc, callback){
	var that = this;
	dbClient.insert(this.collection, doc).next(function(done, result) {
		var obj = new that.schema(result);
		callback(obj);
		done(result);
	});
}

Collection.prototype.remove = function(selector, callback){
	var sel = selector || {}
	dbClient.remove(this.collection,sel).next(function(done, result) {
		callback(result);
		done();
	});
}

Collection.extend = lbUtils.createExtendable(Collection)
module.exports = Collection;
