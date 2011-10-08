var Collection = require('../lib/Collection'),
	assert = require('assert'),
	mongodb = require('../lib/helpers/mongo');
	
var collectionTest = function() {
	this.col = new Collection('testTable', {
											post : {type : 'String'},
											title : {type : 'String', required:true},
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
											updatedDate : {type : 'Date'},
											published : {type : 'Bool', default : false},
											tags : {type : 'Array'},
											author : {type : 'String', default : 'Sam'},
											saId : {type : 'Int', default : 0},
											seo_url : {type : 'String', unique : true}
										});
										
	this.col.addErrorHanlder(function(e) {
		console.log('error occurred on collection');
		console.log(e);
	})
	
	this.badSchema = new this.col.Model();
	this.badSchema.post = 'blah blah blah';
	this.badSchema.saId = '3';

	this.goodSchema = new this.col.Model();
	this.goodSchema.post = 'test me awesome!';
	this.goodSchema.saId = '3';
	this.goodSchema.published = true;
	this.goodSchema.title = 'my title';
	
	this.goodSchema.seo_url='test';
}

collectionTest.prototype.tearDown = function() {
	this.col.dbClient.removeAll('testTable');	
};

collectionTest.prototype.testFullValidate = function() {
	this.goodSchema.fullValidate(function(valid) {
		assert.ok(valid);
	});
	
	this.col.dbClient.insert('testTable', {post:'test post 3', published:true, title:'post 3 title', seo_url:'test'});
	this.goodSchema.fullValidate(function(valid) {
		assert.ok(!valid)
	});
};

collectionTest.prototype.testSaveNew = function() {
	var that = this;

	this.goodSchema.save(function(results, err) {
		assert.strictEqual(results.length, 1, 'The size of the result was ' + results.length + ' should be 1');
		assert.strictEqual(results[0].title, 'my title', 'the titles were incorrect');
	});
}

collectionTest.prototype.testFind = function() {	
	var that = this;
	that.col.dbClient.insert('testTable', {post:'test post 1',  published:true, title:'post 1 title'});
	that.col.dbClient.insert('testTable', {post:'test post 2',  published:true, title:'post 2 title'})

	this.col.find({}, function(results) {
		assert.strictEqual(results.length, 2, 'The result size was ' + results.length + ' should be 2');
		assert.strictEqual(results[0].title, 'post 1 title', 'the title was incorrect');
	});
}

collectionTest.prototype.testRemove = function() {
	this.col.dbClient.insert('testTable', {post:'test post 3',  published:true, title:'post 3 title'});
	this.col.dbClient.insert('testTable', {post:'test post 4',  published:true, title:'post 4 title'})
	
	this.col.remove({post:'test post 3'}, function() {});
	
	this.col.dbClient.find('testTable', {}).next(function(done, results) {
		assert.strictEqual(results.length, 1, 'results should have lenght 1 but has length ' + results.length);
		done();
	});
}

collectionTest.prototype.testSaveExisting = function() {
	var that = this;
	this.col.dbClient.insert('testTable', {post:'test post 4',  published:true, title:'post 4 title'});
	
	this.col.find({title:'post 4 title'}, function(results) {
		console.log('found results');
	})
	
	this.col.nextOperation(function(done, results, err) {
		console.log('updating document');
		results[0].published = false;
		results[0].title = 'new title';
		results[0].save( function() {
			that.col.find({title:'new title'}, function(results) {
				assert.strictEqual(results.length, 1, 'The length was supposed to be 1 but was ' + results.length);
			})
		});
		done();
	})
}

collectionTest.prototype.testValidateSchema = function() {
	assert.ok(!this.badSchema.validate(), 'the bad schema validated');
	assert.ok(this.goodSchema.validate(), 'The good schema did not validate');
}

collectionTest.prototype.done = function() {
	var that = this;
	setTimeout(function() {
		that.col.dbClient.removeAll('testTable');	
		that.col.dbClient.closeConnection(); 
	}, 1000);
}

module.exports = collectionTest;





