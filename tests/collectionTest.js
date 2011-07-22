var Collection = require('../lib/Collection'),
	assert = require('assert'),
	mongodb = require('../lib/helpers/mongo');
	
var collectionTest = function() {
	this.col = new Collection('testTable', {
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
	this.col = new Collection('testTable', {
											post : {type : 'String'},
											title : {type : 'String', required : true},
											createdDate : {type : 'Date'},
											updatedDate : {type : 'Date'},
											published : {type : 'Bool', default : false},
											tags : {type : 'Array'},
											author : {type : 'String', default : 'Sam'},
											saId : {type : 'Int', default : 0}
										});
										
	this.col.addErrorHanlder(function(e) {
		console.log('error occurred on collection');
		console.log(e);
	})
	
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

	this.goodSchema.save(function(results, err) {
		assert.strictEqual(results.length, 1, 'The size of the result was ' + results.length + ' should be 1');
		assert.strictEqual(results[0].title, 'my title', 'the titles were incorrect');
	});
	that.col.dbClient.removeAll('testTable');
}

collectionTest.prototype.testFind = function() {	
	var that = this;
	that.col.dbClient.insert('testTable', {post:'test post 1', createdDate:new Date(), published:true, title:'post 1 title'});
	that.col.dbClient.insert('testTable', {post:'test post 2', createdDate:new Date('5/12/1984'), published:true, title:'post 2 title'})

	this.col.find({}, function(results) {
		assert.strictEqual(results.length, 2, 'The result size was ' + results.length + ' should be 2');
		assert.strictEqual(results[0].title, 'post 1 title', 'the title was incorrect');
		assert.strictEqual(results[1].createdDate.toString(), new Date('5/12/1984').toString(), 'the date was not correct actual ' + results[1].createdDate + ' expected ' + new Date('5/12/1984'));
	});
		
	that.col.dbClient.removeAll('testTable');
}

collectionTest.prototype.testRemove = function() {
	this.col.dbClient.insert('testTable', {post:'test post 3', createdDate:new Date(), published:true, title:'post 3 title'});
	this.col.dbClient.insert('testTable', {post:'test post 4', createdDate:new Date('5/12/1984'), published:true, title:'post 4 title'})
	
	this.col.remove({post:'test post 3'}, function() {});
	
	this.col.dbClient.find('testTable', {}).next(function(done, results) {
		assert.strictEqual(results.length, 1, 'results should have lenght 1 but has length ' + results.length);
		done();
	});
	
	this.col.dbClient.removeAll('testTable');
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





