var config = require('./config'),
	stringUtils = require('./strings');

var globalConfig = config.getConfig();
var baseURL = globalConfig.baseURL + ':' + globalConfig.port + '/';

exports.setCookie = function(name, data, reqData, timeout) {
	if(timeout === undefined) {
		timeout = globalConfig.cookieTimeout;
	}
	
	reqData.headers.push(['Set-Cookie', name + '=' + escape(JSON.stringify(data))]);
};

exports.readCookie = function(name, reqData) {
	var cookies = reqData.request.headers['cookie'].split(';');
	var returnVal = false;
	for(var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].trim().split('=');
		if(cookie[0] === name) {
			var str = unescape( cookie[1] );
			returnVal = JSON.parse( str );
			break;
		}
	}

	return returnVal;
};


