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
	var self = this;
	var fc = new FileCache();

	fs.stat(filepath, function(err, stats) {
		// code snippet taken from https://github.com/ollym/nitrode/blob/master/lib/pubdir.js
		var modsince = Date.parse(self.getHeader('if-modified-since') || self.getHeader('if-unmodified-since'));
		if ( !isNaN(modsince) && stats.mtime <= modsince) {
			self.setResponseCode(304);
			self.endResponse();
		} else {
			var extension = lbstringUtils.getExtension(self.reqData.url.pathname);
				
			if( globalConfig.MIME_TYPES[extension] ) {
				log.trace('using mime-type ' + globalConfig.MIME_TYPES[extension]);
				self.setHeader('Content-Type', globalConfig.MIME_TYPES[extension]);
			}

			self.setHeader('Cache-Control', 'max-age=31536000, public');
			self.setHeader('Last-Modified', stats.mtime.toUTCString());
			self.setHeader('Content-Length', stats.size);

			fc.addListener('data', function(data){
				self.writeData(data);	
			});

			fc.addListener('end', function() {
				self.endResponse();
			});

			fc.addListener('error', function(err) {
				self.setHeader('Content-Type', 'text/plain');
				self.showError("An error occurred retrieving the file: " + err.message);
			});

			fc.read(filepath);
		}
	});
};

module.exports = FileServer;

