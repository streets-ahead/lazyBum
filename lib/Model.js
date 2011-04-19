var logger = require('./helpers/logger');

var log = new logger(module);

var Model = function(){
	this.requiredFields = []
}

Model.prototype.constructor = Model;

Model.prototype.validate = function(doc){
	console.log('validating ...')
	for(x in this.requiredFields){
		if(doc[x] == null){
			return false;
		}
	}
	return true;
}

module.exports = Model;