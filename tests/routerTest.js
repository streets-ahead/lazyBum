var Router = require('../lib/Router'),
	config = require('../lib/helpers/config'),
	assert = require('assert');

var getConfig = config.getConfig;

var RouterTest = function() {

}

RouterTest.prototype.setUp = function() {
	config.getConfig = function() {
		return {
			routeMaps : [
				{
					path: '/users/(.+)',
					dest: '/authors/$1'
				},
				{
					path: '/',
					dest: '/index.html'
				},
				{
					path: '/something/(.+)/(.+)',
					dest: '/$2/$1.json'
				}
			]
		};
	}

	this.router = new Router({});
}

RouterTest.prototype.testReplaceRoute = function() {
	var newUrl = this.router.route({pathname: '/users/authenticate.html'});
	assert.equal(newUrl.pathname, '/authors/authenticate.html');
}

RouterTest.prototype.testPlainRoute = function() {
	var newUrl = this.router.route({pathname: '/'});
	assert.equal(newUrl.pathname, '/index.html');
}

RouterTest.prototype.testDoubleReplaceRoute = function() {
	var newUrl = this.router.route({pathname: '/something/test/blah'});
	assert.equal(newUrl.pathname, '/blah/test.json');
}

RouterTest.prototype.tearDown = function() {
	config.getConfig = getConfig;
}

module.exports = RouterTest;