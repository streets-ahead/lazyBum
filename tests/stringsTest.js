var	strings = require('../lib/helpers/strings'),
	assert = require('assert');

var stringsTest = function() {
	
}

stringsTest.prototype.testRemoveTrailingSlash = function() {
	var withSlash = "http://google.com/";
	assert.equal("http://google.com", withSlash.removeTrailingSlash(), 
								'remove trailing slash test failed: ' + withSlash.removeTrailingSlash());
	
 	var withoutSlash = "http://yahoo.com";
	assert.equal(withoutSlash, withoutSlash.removeTrailingSlash(), 
								'remove trailing slash should not have touched this string: ' + withoutSlash.removeTrailingSlash());
}


module.exports = stringsTest;
