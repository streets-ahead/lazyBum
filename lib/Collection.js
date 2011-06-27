var logger = require('./LBLogger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils'),
	check = require('validator').check,
	sanitize = require('validator').sanitize;

var log = new logger(module);

var Collection = function(collection, schema){
	this.collection = collection;
	this.dbClient = mongo.getDbClient('testme', 'localhost');

	var collectionObj = this;

	//Constructor for "schema objects"
	this.schema = function(obj) {
		for(var field in collectionObj.schema.model) {
			var type = this.schema.model[field][type];
			
			// TODO: auto generate setters and getters for each field specified, should also use the type converters to
			//       convert values in the setter if a type was specified.  I propose we do just dumb conversion and not throw any errors for now
			//       if conversion doesn't work we can set it to null.
			this.__defineGetter__(field, function() {
				
			});
			
			this.__defineSetter__(field, function(val) {
				
			});
		}
		
		// TODO: if an object is passed in, use it to populate the new object
		if(obj) {
			
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
	}
}

// TODO: may be worth breaking this out into another class
Collection.prototype.contraintValidators = {
	type : function(val, obj) {
		var valid = true;
		switch(val) {
			case 'String':
				valid = typeof(obj) === 'string'
			  	break;
			case 'Int':
			  	// TODO: 
			  	break;
			case 'Float':
			  	// TODO: 				
			  	break;
			case 'Array':
				valid = typeof(obj) === 'object' && (obj instanceof Array);
			  	break;
			case 'Object':
			  	// TODO: 
				  break;
			case 'Bool':
			  	// TODO: 
				  break;
			default:
				log.error('Invalid type value in schema model ' + val)
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

Collection.prototype.all =  function(callback){
	this.dbClient.find(this.collection, {}, null).next( callback );
}

Collection.prototype.findOne = function(search, callback){
	this.dbClient.find(this.collection, search, {limit: 1}).next( callback );
}

Collection.prototype.find = function(search, callback){
	this.dbClient.find(this.collection, search, {}).next(callback);
}

Collection.prototype.update = function(obj, callback) {
	this.dbClient.update(this.collection).next(callback);
}

Collection.prototype.create = function(doc, callback){
	this.dbClient.insert(this.collection, doc).next(callback);
}

Collection.prototype.remove = function(selector, callback){
	var sel = selector || {}
	this.dbClient.remove(this.collection,sel).next(callback);
}

Collection.extend = lbUtils.createExtendable(Collection)
module.exports = Collection;
