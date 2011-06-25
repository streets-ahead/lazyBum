var logger = require('./LBLogger'),
	mongo = require('./helpers/mongo'),
	lbUtils = require('./helpers/utils');

var log = new logger(module);

var Model = function(collection){
	this.collection = collection
	this.requiredFields = []
}

Model.prototype.validate = function(doc){
	log.trace('validating ...' + this.requiredFields)

	for(var i=0; i<this.requiredFields.length; i++){
		log.debug(this.requiredFields[i] + ": " + doc[this.requiredFields[i]])
		if(doc[this.requiredFields[i]] == null || doc[this.requiredFields[i]].length < 1){
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

Model.prototype.find = function(search, callback){
	mongo.find(this.collection, search, callback, {})
}

Model.prototype.save = function(doc,callback){
	var selector = {
		id: doc.id
	};
	mongo.update(this.collection, selector, doc, callback)	
}

Model.prototype.create = function(doc, callback){
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

Model.prototype.remove = function(selector, callback){
	var sel = selector || {}
	mongo.remove(this.collection,sel, callback)
}

Model.prototype.getMongo = function(){
  return mongo
}

Model.extend = lbUtils.createExtendable(Model)
module.exports = Model;
