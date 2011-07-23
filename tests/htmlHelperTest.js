var html = require('../lib/helpers/html'),
	assert = require('assert');

var htmlHelperTest = function() {
	
}

htmlHelperTest.prototype.testCreateTitle = function() {
	assert.equal('<title>test</title>', html.createTitle('test'), 'title was not correct: ' + html.createTitle('test'));
}

module.exports = htmlHelperTest;
