/**
 * License Information (MIT)
 *
 * Copyright (c) 2010 Oliver Morgan (oliver.morgan@kohark.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * This code is based on https://github.com/ollym/parrot with some 
 * mods to make it better meet the needs of our framework. 
 *
 * This code is inteneded to get us to launch, but may get replaced by
 * another template engine in the future.
 *
 */

var crypto = require('crypto'),
	Script = process.binding('evals').Script,
	EventEmitter = require('events').EventEmitter,
	fs = require('fs'),
	
	lbConfig = require('./helpers/config'),
	lbUtils = require('./helpers/utils'),
	lbLogger = require('./LBLogger'),
	strUtils = require('./helpers/strings'),
	FileCache = require('./fileCache');

var log = new lbLogger(module);

var Hobo = function(sandbox) {
	var globalConfig = lbConfig.getConfig();
	this.st = globalConfig.templateTags.start;
	this.et = globalConfig.templateTags.end;
	this.cacheTime = globalConfig.templateCacheTime;
	this.cache = {};
	this.fileCache = new FileCache();
	log.trace('hobo initialized');
};

Hobo.TEMPLATE_DIR = '/templates/';
Hobo.TEMPLATE_EXT = '.pt';

var emitter = new EventEmitter();
Hobo.prototype = emitter;

var instance = null;

Hobo.getInstance = function() {
	if (!instance) {
		instance = new Hobo();
	}

	return instance;
};

// add convenience methods available to all templates
var sb = {
	"getBaseURL" : function() {
		return lbConfig.getConfig().baseURL + ":" + lbConfig.getConfig().port + "/";
	},
	log: log
};

Hobo.prototype.clearCache = function() {
	this.cache = {};
};

Hobo.resolveTemplateName = function(templateName, templatedir) {
	log.trace('using template ' + templateName);
	if(!templateName) {
		globalConfig = lbConfig.getConfig();
		templateName = globalConfig.defaultHTMLTemplate;
	}

	if(!templateName.endsWith('.pt')) {
		templateName += Hobo.TEMPLATE_EXT;
	}

	log.trace('templatedir ' + templatedir);
	return templatedir + templateName;
}

Hobo.prototype.compose = function(template, sandbox, callBack) {

	var that = this;
	template = template.toString();
	var includesRE = new RegExp('{\\$(#?.+?)}', ['g', 'm']);
	
	var includes = {}, incl = null;
	while(incl = includesRE.exec(template)) {
		log.trace('include ' + incl[1]);
		includes[ (incl[1])] = false;
	}

	var composeDone = function(data) { 
		log.trace('calling callback ');
		callBack(data);	
	};

	var noIncludes = true;

	for(inclFile in includes) {
		log.trace('includes found, looping ' + inclFile);
		noIncludes = false;
		var orig = inclFile;
		if(inclFile.startsWith('#')) {
			log.trace('get data include ' + inclFile);
			inclFile = sandbox.data[inclFile.substring(1)];
		}

		(function(safeInclFile, origIncl) {
			that.fileCache.readToCallback(process.cwd() + '/templates/' + safeInclFile + '.pt', function(err, data) {
				if(err) {
					log.error(err);
					throw err;
				}
				
				that.compose(data, sandbox, function(data) {
					includes[origIncl] = true;

					data = template.replace(new RegExp('{\\$#?' + origIncl + '}', ['m', 'g']), data);

					var done = true;
					for(i in includes) {
						if(!includes[i]) {
							done = false;
							break;
						}
					}

					if(done) {
						composeDone(data);
					}
				});
			});
		})(inclFile, orig);
	}

	if(noIncludes) {
		composeDone(template);
	}
};

Hobo.prototype.render = function(templateName, sandbox, templatedir) {
	var that = this;
	sb = lbUtils.extend(sb, sandbox);

	var buffer = '';
	var shouldBuffer = false;

	sb.print = function(chunk) {
		if(shouldBuffer) {
			buffer += chunk ? chunk.toString() : '';
		} else {
			that.emit('data', chunk ? chunk.toString() : '');	
		}
	}

	tmpl = Hobo.resolveTemplateName(templateName, templatedir);
	that.fileCache.readToCallback(tmpl, function(err, data) {
		if(err) {
			log.error(err);
			throw err;
		} 

		that.compose(data, sandbox, function(template) {
			log.trace('composition done');
			template = template.toString();
			template = 'print("' + template.replace(/"/gm, '\\"') + '");';
			var catchStr = '"); try { print($1); } catch (e) {log.error(e.msg); log.error(e.stack); print("$1");} print("';
			template = template
				.replace(new RegExp(that.st + '=(.+?)' + that.et, ['g', 'm']), catchStr)
				.replace(new RegExp(that.st + '(.+?)' + that.et, ['g', 'm']), '"); $1 print("')
				.replace(new RegExp('\n', ['g', 'm']), '\\n')
				.replace(new RegExp('\r', ['g', 'm']), '\\r')
				.replace(new RegExp('\t', ['g', 'm']), '\\t');
			Script.runInNewContext(template, sb);
			if(shouldBuffer) {
				that.emit('data', buffer);	
			} 
			that.emit('end');
		});
	});
};

module.exports = Hobo;

