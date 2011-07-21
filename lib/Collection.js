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
	this.dbClient = dbClient;
	var collectionObj = this;	
	
	//Constructor for "model objects"
	this.Model = function(obj) {
		collectionObj.Model.schema['_id'] = {type:'String'};
		for(var field in collectionObj.Model.schema) {
			var that = this;
			var type = collectionObj.Model.schema[field]['type'];
			var converter = collectionObj.typeConverters[type];
			
			this.dirty = true;
			this.persisted = false;
			this.errorMessage = "";
			this.presaveActions = [];

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
			for(var i = 0; i < that.presaveActions.length; i++) {
				that.presaveActions[i].call(that);
			}
			
			if(this.validate()) {
				if(this.persisted) {
					collectionObj.update(this.getDataObj(), function(results) {
						that.dirty = false;
						this.persisted = true;
						callback(results);
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
		
		// Gonna be bad for the first pass, fair warning
		// TODO: not tested, might work
		validate : function() {
			var valid = true
			for(var field in collectionObj.Model.schema) {
				for(var constraint in collectionObj.Model.schema[field]) {
					var validator = collectionObj.contraintValidators[constraint];
					if(validator) {
						valid = validator(collectionObj.Model.schema[field][constraint], this[field]);
					// console.log('valid ' + constraint + ' ' + valid);
						if(!valid) {
							this.errorMessage = "failed to pass constraint " + constraint;
							break;
						}
					}
				}
				
				if(!valid) {
					break;
				}
			}
			
			return valid;
		},
		getDataObj : function() {
			var dataObj = {};
			for(var prop in this) {
				if(this.hasOwnProperty(prop) && collectionObj.Model.schema.hasOwnProperty(prop)) {
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
		},
		addPreSaveAction : function(func) {
			this.presaveActions.push(func);
		},
		removePreSaveAction : function(func) {
			this.presaveActions.splice(this.presaveActions.indexOf(func), 1);
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
 				valid = obj.toString().match(/^(?:-?(?:0|[1-9][0-9]*))$/) !== null;
			  	break;
			case 'Float':
				valid = obj.toString().match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/) !== null;
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
		
		if((typeof(obj) === 'undefined') || obj === null) {
			valid = true;
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
	required : function(val, obj) {
		if(val) {
			return !(obj === null || (typeof(obj) === 'undefined') || obj.match(/^[\s\t\r\n]*$/));
		} else {
			return true;
		}
	},
	regex : function(val, obj) {
		return obj.match(val) !== null;
	}
	
}

Collection.prototype.objectsWithResultArray = function(done, results, callback) {
	var objs = [];

	for(var i = 0; i < results.length; i++) {
		objs[i] = new this.Model(results[i]);
		objs[i].persisted = true;
	}

	if(callback) {	
		callback(objs); 
	}
	done(objs);
} 

Collection.prototype.findAll =  function(callback){
	var that = this;
	this.dbClient.find(this.collection, {}, null).next( function(done, results, err) {
		if(err) {
			throw err;
		}
		that.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.findOne = function(search, callback){
	var that = this;
	this.dbClient.find(this.collection, search, {limit: 1}).next( function(done, result, err) {
		if(err) {
			throw err;
		}
		that.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.find = function(search, callback){
	var that = this;
	this.dbClient.find(this.collection, search, {}).next( function(done, result, err) {
		if(err) {
			throw err;
		}
		that.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.update = function(obj, callback) {
	this.dbClient.update(this.collection, obj).next(function(done, result, err) {
		console.log('BLAH' + err);
		if(err) {
			throw err;
		}
		that.objectsWithResultArray(done, results, callback); 
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
			throw err;
		}
		that.objectsWithResultArray(done, results, callback); 
	});
}

Collection.prototype.remove = function(selector, callback){
	var sel = selector || {}
	this.dbClient.remove(this.collection,sel).next(function(done, result, err) {
		if(err) {
			throw err;
		}
		callback(result);
		done();
	});
}

Collection.extend = lbUtils.createExtendable(Collection)
module.exports = Collection;
