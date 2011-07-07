var Collection = require('../lib/Collection'),
	assert = require('assert');

// var col = new Collection('myTable', {
// 										post : {type : 'String'},
// 										title : {type : 'String', required:true},
// 										createdDate : {type : 'Date'},
// 										updatedDate : {type : 'Date'},
// 										published : {type : 'Bool', default : false},
// 										tags : {type : 'Array'},
// 										author : {type : 'String', default : 'Sam'},
// 										saId : {type : 'Int', default : 0}
// 									});
// 									
// //console.log(col)
// var schemaTest = new col.schema();
// schemaTest.post = 'test me awesome!';
// schemaTest.saId = '3';
// schemaTest.createdDate = 'May 12, 1984';
// // schemaTest.title = 'blah';
// 
// // console.log(schemaTest.post);
// // console.log(schemaTest.published);
// // console.log(schemaTest.createdDate);
// // console.log(schemaTest.author);
// // console.log(schemaTest.saId);
// 
// console.log(schemaTest.validate());
// console.log("error message " + schemaTest.errorMessage);
// 
// 
// // console.log('test2')
// // col.findAll(function(s2) {
// // 	console.log(s2[0].post);
// // 	console.log(s2[0].title);
// // 	console.log(s2[0].createdDate);
// // 	console.log(s2[0].published);
// // 	console.log(s2[0].author);
// // 	console.log(s2[0].saId);
// // 	console.log(s2[0].id);
// // });
// 
// col.create({
// 	post : 'test me',
// 	title : 'My title',
// 	createdDate : new Date(),
// 	published : false,
// 	author : 'Sam'
// }, function(obj) {
// 	//console.log('test3')
// 	//console.log(obj);	
// });
// 
// 
// col.dbClient.closeConnection();

var collectionTest = function() {
	this.col = new Collection('myTable', {
											post : {type : 'String'},
											title : {type : 'String', required:true},
											createdDate : {type : 'Date'},
											updatedDate : {type : 'Date'},
											published : {type : 'Bool', default : false},
											tags : {type : 'Array'},
											author : {type : 'String', default : 'Sam'},
											saId : {type : 'Int', default : 0}
										});
}

collectionTest.prototype.setUp = function() {
	this.col = new Collection('myTable', {
											post : {type : 'String'},
											title : {type : 'String', required : true},
											createdDate : {type : 'Date'},
											updatedDate : {type : 'Date'},
											published : {type : 'Bool', default : false},
											tags : {type : 'Array'},
											author : {type : 'String', default : 'Sam'},
											saId : {type : 'Int', default : 0}
										});
	
	this.badSchema = new this.col.Model();
	this.badSchema.post = 'blah blah blah';
	this.badSchema.saId = '3';
	this.badSchema.createdDate = 'May 12, 1984';

	this.goodSchema = new this.col.Model();
	this.goodSchema.post = 'test me awesome!';
	this.goodSchema.saId = '3';
	this.goodSchema.createdDate = 'May 12, 1984';
	this.goodSchema.published = true;
	this.goodSchema.title = 'my title';
}

collectionTest.prototype.testSaveNew = function() {
	var that = this;

	this.goodSchema.save(function(results) {	
	throw 'wwewewe'	
//		assert.strictEqual(results.length, 1, 'The size of the result was ' + results.length + ' should be 1');
//		assert.strictEqual(results[0].title, 'my title', 'the titles were incorrect');
	});
}

collectionTest.prototype.testFind = function() {
	
}

collectionTest.prototype.testSaveExisting = function() {
	
}

collectionTest.prototype.done = function() {
	this.col.dbClient.closeConnection();
}

collectionTest.prototype.testValidateSchema = function() {
	assert.ok(!this.badSchema.validate(), 'the bad schema validated');
	assert.ok(this.goodSchema.validate(), 'The good schema did not validate');
}

module.exports = collectionTest;





