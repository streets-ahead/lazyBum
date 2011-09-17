var cookie = require('./cookie'),
	crypto = require('crypto'),
	config = require('./config'),
	lbLogger = require('./LBLogger');
	
var log = new lbLogger(module);
	
var myconfig = config.getConfig();
var sessionTimeout = myconfig.sessionTimeout;

var SESSION_NAME = 'lbSession'

var sessionHelper = {
	initSession: function(reqData) {
		var sessCookie;
		try {
			sessCookie = cookie.readCookie(SESSION_NAME, reqData, true);
		} catch(e) {
			log.error('An error occurred trying to read the session cookie');
		}
		reqData.session = new Session(sessCookie, reqData);
	},
	
	expireSession: function(reqData) {
		reqData.session = new Session(sessCookie, reqData);
	},
	
	getIp: function(reqData) {
		var ipAddress = null;
	    try {
			ipAddress = reqData.request.headers['x-forwarded-for'];
	    } catch ( error ) {
			ipAddress = reqData.request.connection.remoteAddress;
	    }

		return ipAddress;
	},

	getUserAgent: function(reqData) {
		return reqData.request['user-agent'];
	}
	
	// TODO: Add flashdata, data that only exists between two requests
};

module.exports = sessionHelper;

// TODO: should probably make this more secure
var generateSessionId = function(ip, userAgent) {
	var t = new Date().getTime();
	var s = Math.floor(Math.random()*100000);
	var str = s.toString() + t + ip + userAgent;
	var hash  = crypto.createHash('sha1');
	hash.update(str);
	return hash.digest('base64');
};

var Session = function(sessionData, reqData) {
	if(sessionData && sessionData.id) {
		this.data = sessionData;
	} else {
		this.data = {};
		var ip = sessionHelper.getIp(reqData);
		var userAgent = sessionHelper.getUserAgent(reqData);
		this.data.id = generateSessionId(ip, userAgent);	
	}
	
	cookie.setCookie(SESSION_NAME, this.data, reqData, {timeout: sessionTimeout, path: '/', http: true, encrypt:true});	
};

Session.prototype.get = function(key) {
	return this.data[key];
};

Session.prototype.set = function(key, value, reqData) {
	this.data[key] = value;
	cookie.setCookie(SESSION_NAME, this.data, reqData, {timeout: sessionTimeout, path: '/', http: true, encrypt:true});
};

