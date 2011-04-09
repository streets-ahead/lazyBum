var LBBase = require('LBBase.js'),
	lb = require('lbConfig'),
	fs = require('fs'),
	stringUtils = require('stringUtils');

var FileServer = LBBase.extend(function() {
	FileServer.super_.apply(this, arguments);
});

FileServer.prototype.serve = function(filepath) {
	var globalConfig = lb.getConfig();
	var that = this;

	var fileStream = fs.createReadStream(filepath);
	
	var extension = stringUtils.getExtension(that.reqData.url.pathname);
	
	if( globalConfig.MIME_TYPES[extension] ) {
		log.info('using mime-type ' + globalConfig.MIME_TYPES[extension]);
		that.setHeader('Content-Type', globalConfig.MIME_TYPES[extension]);
	}

	fileStream.addListener('data', function(data){
		that.writeData(data);	
	});

	fileStream.addListener('end', function() {
		that.endResponse();
	});

	fileStream.addListener('error', function(err) {
		that.setHeader('Content-Type', 'text/plain');
		that.showError("An error occurred retrieving the file: " + err.message);
	});
};

module.exports = FileServer;

