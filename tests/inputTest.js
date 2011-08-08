var	input = require('../lib/helpers/input'),
	assert = require('assert');

var inputTest = function() {

}

inputTest.prototype.setUp = function() {
	this.template = {
						post : {type : 'String'},
						title : {type : 'String', required:true},
						updatedDate : {type : 'Date'},
						published : {type : 'Bool', default : false},
						tags : {type : 'Array'},
						author : {type : 'String', default : 'Sam'},
						saId : {type : 'Int', default : 0}
					}
	
}

// TODO: improve to ensure that all contraints and types are tested.
inputTest.prototype.testValidateSimpleObject = function() {
	assert.ok(input.validateObject( {
							post:'test post', 
							title : 'test title', 
							updatedDate : new Date(), 
							tags : [1, 2, 3]
						}, this.template),  'valid object did not validate');
						
	assert.ok(!input.validateObject({}, this.template), 'invalid object validated');
}


module.exports = inputTest;
