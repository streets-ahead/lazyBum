var LBBase = require('./LBBase.js'),
	logger = require('./LBLogger');

var log = new logger(module);

var Controller = LBBase.extend(function() {
	if(this.restfulCollection) {
		initRestful.call(this, this.restfulCollection);
	}
	Controller.super_.apply(this, arguments);
});

var initRestful = function(col) {
	if(!this.index_put) {
		Controller.prototype.index_put = function(urlParts, query, post) {
		
		};
	}

	if(!this.index_get) {
		Controller.prototype.index_get = function(urlParts, query) {
			var self = this;
			self.internalFind(urlParts, query, function(results, err) {
				if(err) {
					self.writeResponse(err, 500);
				} else if(results.length === 0) {
					self.showNotFound();
				} else {
					self.writeResponse(results);
				}
			});
		};
	}

	if(!this.index_post) {
		Controller.prototype.index_post = function(urlParts, query, postData) {
			var self = this;
			self.internalCreate(urlParts, query, post, function(results, errors) {
				if(errors) {
					var data = {
						inputData: postData,
						errors: errors
					}
					self.writeResponse(data, 500);
				} else {
					self.writeResponse(results, 201);
				}
			}
		};
	}

	if(!this.index_delete) {
		Controller.prototype.index_delete = function(urlParts, query) {
		
		};
	}
	
	Controller.prototype.internalFind = function(urlParts, query, callback) {
		var self = this;
		var qs = {};
		if(urlParts.length > 0) {
			qs[self[col].lbId] = urlParts[0];
		} else {
			qs = query;
		}
		
		self[col].find(qs, function(results, err) {
			callback(results, err);
		})
	}
	
	Controller.prototype.internalCreate = function(urlString, query, postData, callback) {
		var self = this;
		var binding = this.bindInput(this.article, postData);
		if(binding.valid){
			binding.object.save(function(results, errors){
				callback(results, errors);
			});
		} else {
			callback([], binding.object);
		}
	}
	
	Controller.prototype.internalUpdate = function(urlString, query, postData, callback) {
	
	}
	
	Controller.prototype.internalDelete = function(urlString, query, callback) {

	}
}

Controller.prototype.bindInput = function(collection, obj) {
	var obj = collection.create(obj);
	var valid = obj.validate();
	
	if(valid) {
		return {valid : true, object : obj};
	} else {
		return {valid : false, object : obj.errors};
	}
};

Controller.prototype.writeResponse = function(data, template, responseCode) {
	if(arguments.length === 2) {
		if(typeof arguments[1] === 'number') {
			responseCode = arguments[1];
		} else {
			template = arguments[1];
			responseCode = 200;
		}
	} else if(arguments.length === 1) {
		responseCode = 200;
	}
	
	log.trace('sending writeResponse event');
	var sb = {};
	if(typeof this.helpers !== 'undefined') {
		for(var i = 0; i < this.helpers.length; i++) {
			sb[this.helpers[i]] = this[this.helpers[i]];
		}		
		log.debug("helpers ");
	}
	
	this.emit(LBBase.LBEVENT, LBBase.CONTROLLER_COMPLETE, this.reqData, [data, responseCode, sb, template]);
};

Controller.prototype.urlPathToMap  = function(path) {
	var retObj = {};
	for(var i = 0; i < path.length; i+=2) {
		var key = path[i];
		var val = (i + 1) < path.length ? path[i + 1] : null;
		retObj[key] = val;
	}
	
	return retObj;
};


module.exports = Controller;

