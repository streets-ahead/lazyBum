/*
	node-logger library
	http://github.com/igo/node-logger
	
	Copyright (c) 2010 by Igor Urmincek

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/*
 * This code is based on the code from node-logger.js (http://github.com/igo/node-logger) and modified for use in the LB framework.
 * Many thanks to Igor Urminek for creating a simple, clean node logger and allowing the world
 * to use it.
 *
 */

var lb = require('./helpers/config'),
	
	fs = require('fs'),
	util = require('util');

var padZero = function(number) {
	var n = String(number);
	if (number < 10) {
		return '0' + n;
	} else {
		return n;
	}
}

var pad2Zeros = function(number) {
	var n = String(number);
	if (number < 10) {
		return '00' + n;
	} else if (number < 100) {
		return '0' + n;
	} else {
		return n;
	}
}

var getDate = function() {
	var now = new Date();
	return now.getFullYear() + '-' + padZero(now.getMonth() + 1) + '-' + padZero(now.getDate()) + ' ' +
		padZero(now.getHours()) + ':' + padZero(now.getMinutes()) + ':' + padZero(now.getSeconds()) + '.' + pad2Zeros(now.getMilliseconds());
}

var getLine = function(module) {
	try {
		throw new Error();
	} catch(e) {
		// now magic will happen: get line number from callstack
		var line = e.stack.split('\n')[3].split(':')[1];
		return line;
	}
}

var getClass = function(module) {
	if (module) {
		if (module.id) {
			if (module.id == '.') {
				return 'main';
			} else {
				return module.id.substr(module.id.lastIndexOf('/'));
			}
		} else {
			return module;
		}
	} else {
		return '<unknown>';
	}
}

var getMessage = function(msg) {
	if (typeof msg == 'string') {
		return msg;
	} else {
		return util.inspect(msg, false, 10);
	}
}

var Logger = function(module) {
	
	this.module = module;
};

var LOG_LEVELS = {'trace': 5, 'debug': 4, 'info': 3, 'warn': 2, 'error': 1};
var logAppenders = lb.getConfig().logAppenders;
Logger.fileStreams = {};

logAppenders.forEach(function(it){
	if(!Logger.fileStreams[it.file]) {	
		if(it.file === "console") {
			Logger.fileStreams[it.file]	= process.stdout;
		} else {
			Logger.fileStreams[it.file] = fs.createWriteStream(process.cwd() + "/logs/" + it.file, {flags:'a'});
		}
	}
	
});

process.on('exit', function () {
	for(var stream in Logger.fileStreams) {
		if(stream != 'console') {
			Logger.fileStreams[stream].end(getDate() + " SYSTEM lazyBum is shutting down...\n");
		} else {
			Logger.fileStreams[stream].write(getDate() + " SYSTEM lazyBum is shutting down...\n");
		}
	}
});

for (var level in LOG_LEVELS) {
	(function(logNum, logStr) {
		Logger.prototype[level] = function(msg, obj) {
			var that = this;
			logAppenders.forEach(function(it) {
				var appLevelNum = LOG_LEVELS[it.level.toLowerCase()];
				if(appLevelNum >= logNum) {
					that.writeLog(msg, obj, it.file, logStr.toUpperCase());
				}
			});
		}
	})(LOG_LEVELS[level], level);
}

Logger.prototype.access = function(req, msg) {
	logAppenders.forEach(function(it) {
		if(it.level === 'access') {
			var ipAddress = req.headers['x-forwarded-for'];
			if(ipAddress === undefined) {
				ipAddress = req.connection.remoteAddress;
			}

			var logMessage = getDate() + ' ACCESS ' + ipAddress + ' - ' + (msg || '') + '\n';
			Logger.fileStreams[it.file].write(logMessage);
		}
	});
};

Logger.prototype.writeLog = function(msg, obj, file, levelStr) {
	var logMessage;
	var colors = {'TRACE' : 32, 'DEBUG' : 34, 'INFO' : 37, 'WARN' : 35, 'ERROR' : 31};
	var color = colors[levelStr];
	if(levelStr.length === 4) {
		levelStr += '  ';
	} else {
		levelStr += ' '
	}

	if(file === "console") {
		logMessage = '\x1B[' + color + 'm' + getDate() + ' ' + levelStr + ' ' + getClass(this.module) +':' + getLine(this.module) + ' - ' + getMessage(msg) + '\x1B[0m' + '\n';
	} else {
		logMessage = getDate() + ' ' + levelStr + ' ' + getClass(this.module) +':' + getLine(this.module) + ' - ' + getMessage(msg) + '\n';
	}

	Logger.fileStreams[file].write(logMessage);	
};

module.exports = Logger;

