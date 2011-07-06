var LBBase = require('./LBBase.js'),
	lbconfig = require('./helpers/config'),
	lbstringUtils = require('./helpers/strings'),
	FileCache = require('./fileCache'),
	fs = require('fs'),
	lbLogger = require('./LBLogger');	

var log = new lbLogger(module);

var FileServer = LBBase.extend(function() {
	FileServer.super_.apply(this, arguments);
});

FileServer.prototype.serve = function(filepath) {
	var globalConfig = lbconfig.getConfig();
	var that = this;
	var fc = new FileCache();

	fs.stat(filepath, function(err, stats) {
		// code snippet taken from https://github.com/ollym/nitrode/blob/master/lib/pubdir.js
		var modsince = Date.parse(that.getHeader('if-modified-since') || that.getHeader('if-unmodified-since'));
		if ( !isNaN(modsince) && stats.mtime <= modsince) {
			that.setResponseCode(304);
			that.endResponse();
		} else {
			var extension = lbstringUtils.getExtension(that.reqData.url.pathname);
				
			if( globalConfig.MIME_TYPES[extension] ) {
				log.trace('using mime-type ' + globalConfig.MIME_TYPES[extension]);
				that.setHeader('Content-Type', globalConfig.MIME_TYPES[extension]);
			}

			that.setHeader('Cache-Control', 'max-age=31536000, public');
			that.setHeader('Last-Modified', stats.mtime.toUTCString());
			that.setHeader('Content-Length', stats.size);

			fc.addListener('data', function(data){
				that.writeData(data);	
			});

			fc.addListener('end', function() {
				that.endResponse();
			});

			fc.addListener('error', function(err) {
				that.setHeader('Content-Type', 'text/plain');
				that.showError("An error occurred retrieving the file: " + err.message);
			});

			fc.read(filepath);
		}
	});
};

module.exports = FileServer;

