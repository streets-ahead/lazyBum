var config = require('./config'),
	stringUtils = require('./strings'),
	crypto = require('crypto');

var globalConfig = config.getConfig();
var baseURL = globalConfig.baseURL + ':' + globalConfig.port + '/'; 

var encrypt = function(str) {
	var cipher = crypto.createCipher('des3', globalConfig.cookieKey);
	var enc = cipher.update(str, 'utf8', 'hex');
	enc += cipher.final('hex');
	
	return enc;
}

var decrypt = function(str) {
	var decipher = crypto.createDecipher('des3', globalConfig.cookieKey);
	var dec = decipher.update(str, 'hex', 'utf8');
	dec += decipher.final('utf8');
	
	return dec;
}

// TODO: this is not used yet, but I would like to add the option of createing verifiable cookies

// opts = {timeout: in minutes, path: str, http: bool, secure:bool, domain:str}
exports.setCookie = function(name, data, reqData, opts) {
	var str = "";
	if(opts) {
		if(opts.timeout && opts.timeout !== '') {
			var e = new Date().getTime() + (opts.timeout*1000*60);
			str = "; Expires=" + new Date(e).toUTCString();
		}
	
		if(opts.path) {
			str += "; Path=" + opts.path;
		}
	
		if(opts.http) {
			str += '; HttpOnly';
		}
	
		if(opts.secure) {
			str += '; Secure';
		}
	
		if(opts.domain) {
			str += "; Domain=" + opts.domain;
		}
	}
	
	var headers = reqData.headers;
	for(var i = 0; i < headers.length; i++) {
		if(headers[i][0] === 'Set-Cookie') {
			if(headers[i][1].startsWith(name)) {
				reqData.headers.splice(i, 1);
			}
		}
	}
	
	var body = JSON.stringify(data);
	if(opts && opts.encrypt) {
		body = encrypt(body);
	}
	reqData.headers.push(['Set-Cookie', name + '=' + escape(body) + str]);
};

exports.readCookie = function(name, reqData, encrypted) {
	var returnVal = false;
	if(reqData.request.headers['cookie']) {
		var cookies = reqData.request.headers['cookie'].split(';');
		for(var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i].trim().split('=');
			if(cookie[0] === name) {
				var cookieStr = unescape(cookie[1]);
				if(encrypted) {
					cookieStr = decrypt(cookieStr);
				}
				returnVal = JSON.parse( cookieStr );
				break;
			}
		}
	} 

	return returnVal;
};


