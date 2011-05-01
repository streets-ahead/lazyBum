var logger = require('./helpers/logger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils');

var log = new logger(module);

var Model = function(collection){
	this.collection = collection
	this.requiredFields = []
}

Model.prototype.all =  function(callback){
	console.log("find all for " + this.collection)
	mongo.find(this.collection, {}, callback, null);
}

Model.prototype.validate = function(doc){
	console.log('validating ...' + this.requiredFields)

	for(var i=0; i<this.requiredFields.length; i++){
		console.log(this.requiredFields[i] + ": " + doc[this.requiredFields[i]])
		if(doc[this.requiredFields[i]] == null){
			return false;
		}
	}
	return true;
}

Model.extend = lbUtils.createExtend(Model)
module.exports = Model;