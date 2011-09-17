var	cookie = require('../lib/helpers/cookie'),
	assert = require('assert');

var cookieTest = function() {

}

cookieTest.prototype.setUp = function() {
	this.reqData = {};
	this.reqData.request = {};
	this.reqData.headers = [];
	this.reqData.request.headers = {};
	this.reqData.request.headers['cookie'] = 'name={"thing1":"thing2"}; name2={"test":"blah"}';
}

cookieTest.prototype.testSetCookie = function() {
	cookie.setCookie('cookie1', {test:'test1'}, this.reqData);
	assert.equal(this.reqData.headers.length, 1);
	assert.equal(this.reqData.headers[0].length, 2);
	assert.equal(this.reqData.headers[0][0], 'Set-Cookie');
	assert.equal(this.reqData.headers[0][1], 'cookie1=%7B%22test%22%3A%22test1%22%7D');
}

cookieTest.prototype.testSetCookieTimeout = function() {
	cookie.setCookie('cookie1', {test:'test1'}, this.reqData, {timeout: 10080});
	assert.ok(this.reqData.headers[0][1].startsWith('cookie1=%7B%22test%22%3A%22test1%22%7D; Expires='));
}

cookieTest.prototype.testSetMultipleCookies = function() {
	cookie.setCookie('cookie1', {test:'test1'}, this.reqData);
	assert.equal(this.reqData.headers.length, 1);	
	assert.equal(this.reqData.headers[0].length, 2);
	assert.equal(this.reqData.headers[0][0], 'Set-Cookie');
	assert.equal(this.reqData.headers[0][1], 'cookie1=%7B%22test%22%3A%22test1%22%7D');
	
	cookie.setCookie('cookie2', {test:'test2'}, this.reqData);
	assert.equal(this.reqData.headers.length, 2);	
	assert.equal(this.reqData.headers[1][1], 'cookie2=%7B%22test%22%3A%22test2%22%7D');
}

cookieTest.prototype.testReadCookie = function() {
	var cookie1 = cookie.readCookie('name', this.reqData);
	assert.equal(cookie1.thing1, 'thing2');
	
	var cookie2 = cookie.readCookie('name2', this.reqData);
	assert.equal(cookie2.test, 'blah');
}


module.exports = cookieTest;
