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

	var expected = '<ol><li class="currentPage"><a href="/articles?currentPage=1">1</a></li><li><a href="/articles?currentPage=2">2</a></li><li><a href="/articles?currentPage=3">3</a></li><li class="nextPageLink"><a href="/articles?currentPage=2">&gt;</a></li><li class="lastPageLink"><a href="/articles?currentPage=3">Last&nbsp;&nbsp;&gt;&gt;</a></li></ol>';
		var actual = this.p.createLinks();
		assert.equal(expected, actual, 'links did not match \n ' + actual);
		
		this.p.currPage = 3;
		expected = '<ol><li class="firstPageLink"><a href="/articles?currentPage=1">&lt;&lt;&nbsp;&nbsp;First</a></li><li class="prevPageLink"><a href="/articles?currentPage=2">&lt;</a></li><li><a href="/articles?currentPage=1">1</a></li><li><a href="/articles?currentPage=2">2</a></li><li class="currentPage"><a href="/articles?currentPage=3">3</a></li></ol>';
		actual = this.p.createLinks();
		assert.equal(expected, actual, 'links did not match for test 2 \n ' + actual);
}

pagingHelperTest.prototype.testGetCurrentRestuls = function() {
	var expected = [ 'one', 'two', 'three' ];
	var actual = this.p.getCurrentResults();
	assert.deepEqual(expected, actual, 'did not match ' + actual);
	
	
	expected = [ 'four', 'five', 'six' ];
	this.p.currPage = 2;
	actual = this.p.getCurrentResults();
	assert.deepEqual(expected, actual, 'did not match ' + actual);
}

module.exports = pagingHelperTest;