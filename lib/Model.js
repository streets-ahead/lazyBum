var logger = require('./helpers/logger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils');

var log = new logger(module);

var Model = function(collection){
	this.collection = collection
	this.requiredFields = []
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

Model.prototype.all =  function(callback){
	mongo.find(this.collection, {}, callback, null);
}

Model.prototype.findOne = function(search, callback){
	mongo.find(this.collection, search, callback, {limit: 1})
}

Model.prototype.save = function(doc,callback){
	var selector = {
		id: doc.id
	};
	mongo.update(this.collection, selector, doc, callback)	
}

Model.prototype.remove = function(doc, callback){
	
}

Model.extend = lbUtils.createExtend(Model)
module.exports = Model;