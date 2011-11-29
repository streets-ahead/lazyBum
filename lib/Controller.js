var LBBase = require('./LBBase.js'),
	logger = require('./LBLogger');

var log = new logger(module);

var Controller = LBBase.extend(function() {
	if(this.restfulCollection) {
		if(!this.collections) {
			this.collections = [];
		}
		this.collections.push(this.restfulCollection);
	}
	Controller.super_.apply(this, arguments);
	if(this.restfulCollection) {
		initRestful.call(this, this.restfulCollection);
	}
	
});

var initRestful = function(col) {
	if(!this.index_put) {
		Controller.prototype.index_put = function(urlParts, query, postData) {
			var self = this;
			self.internalUpdate(urlParts, query, postData, function(results, errors) {
				if(errors) {
					var data = {
						inputData: postData,
						errors: errors
					}
					self.writeResponse(data, 500);
				} else {
					self.writeResponse(results, 200);
				}
			});
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
			self.internalCreate(urlParts, query, postData, function(results, errors) {
				if(errors) {
					var data = {
						inputData: postData,
						errors: errors
					}
					self.writeResponse(data, 500);
				} else {
					self.writeResponse(results, 201);
				}
			});
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
		
		self[self.restfulCollection].find(qs, function(results, err) {
			if(results.length === 1) {
				callback(results[0].getDataObj(), err);
			} else {
				callback(results, err);
			}
		})
	}
	
	Controller.prototype.internalCreate = function(urlString, query, postData, callback) {
		var self = this;
		var binding = this.bindInput(self[col], postData);
		if(binding.valid){
			binding.object.save(function(results, errors){
				callback(results, errors);
			});
		} else {
			callback([], binding.object);
		}
	}
	
	Controller.prototype.internalUpdate = function(urlParts, query, postData, callback) {
		var self = this;
		queryObj = {};
		if(urlParts.length > 0) {
			queryObj[self[col].lbId] = urlParts[0];
		} else {
			callback([], ["notFound"]);
			return;
		}
		
		self[col].findOne(queryObj, function(result, err){
			if(result) {
				for(attr in postData){
					if(attr && attr.length>0){
						log.trace('update ' + attr + ' value ' + postData[attr]);
						result[attr] = postData[attr]
					}
				}
				result.save(function(results, errors){
					callback(results, errors);
				})
			} else {
				callback([], ["notFound"]);
			}
		});
	}
	
	Controller.prototype.internalDelete = function(urlString, query, callback) {

	}
}

Controller.prototype.bindInput = function(collection, obj, useRequired) {
	var obj = collection.create(obj);
	var valid = obj.validate(useRequired);
	
	if(valid) {
		return {valid : true, object : obj};
	} else {
		return {valid : false, object : obj.errors};
	}
};

Controller.prototype.writeResponse = function(data, template, responseCode) {
	if(arguments.length === 2) {
		if((typeof arguments[1]) === 'string') {
			template = arguments[1];
			responseCode = 200;
		} else {
			template = null;
			responseCode = arguments[1];
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

