var paging = require('../lib/helpers/paging'),
	assert = require('assert');

var pagingHelperTest = function() {
	this.p = null;
}

pagingHelperTest.prototype.setUp = function() {
	this.p = paging.createPagination(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'], '/articles', '');
	this.p.setPageSize(3);
}

pagingHelperTest.prototype.testCreateLinks = function() {
	var expected = '<p><a href="/articles?currentPage=0">&lt;&lt;&nbsp;&nbsp;First</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=0">&lt;</a>&nbsp;&nbsp;&nbsp;&nbsp;<strong><a href="/articles?currentPage=0">0</a></strong>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=1">1</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=2">2</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=1">&gt;</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=2">Last&nbsp;&nbsp;&gt;&gt;</a></p>';
	var actual = this.p.createLinks();
	assert.equal(expected, actual, 'links did not match \n ' + actual);
	
	this.p.currPage = 2;
	expected = '<p><a href="/articles?currentPage=0">&lt;&lt;&nbsp;&nbsp;First</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=0">&lt;</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=0">0</a>&nbsp;&nbsp;&nbsp;&nbsp;<strong><a href="/articles?currentPage=1">1</a></strong>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=2">2</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=1">&gt;</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/articles?currentPage=2">Last&nbsp;&nbsp;&gt;&gt;</a></p>';
	actual = this.p.createLinks();
	assert.equal(expected, actual, 'links did not match for test 2 \n ' + actual);
}

pagingHelperTest.prototype.testGetCurrentRestuls = function() {
	var expected = [ 'one', 'two', 'three' ];
	var actual = this.p.getCurrentResults();
	assert.equal(expected, actual, 'did not match ' + actual);


	expected = [ 'four', 'five', 'six' ];
	this.p.currPage = 2;
	actual = this.p.getCurrentResults();
	assert.equal(expected, actual, 'did not match ' + actual);
}

module.exports = pagingHelperTest;