var fs = require('fs'),
	EventEmitter = require('events').EventEmitter,
	crypto = require('crypto'),
	lbLogger = require('./LBLogger');

var log = new lbLogger(module);

var cache = {};
var cacheList = [];
var MAX_SIZE = '20000';
var MAX_CACHE_SIZE = 20;

var FileCache = function() { 
	log.debug('STARTING CACHE');
}

var emitter = new EventEmitter();
FileCache.prototype = emitter;

FileCache.prototype.read = function(filepath) {
	var that = this;

	fs.stat(filepath, function(err, stats) {
		if(err) {
			that.emit('error', err);
			return;
		}

		var hash = crypto.createHash('md5');
		hash.update(filepath);
		var filenameHash = hash.digest('hex');

		if(cache[filenameHash]) {
			log.debug('cache hit for file ' + filepath);
			cachedFile = cache[filenameHash];
		
			if ( stats.mtime <= cachedFile.timeStamp ) {
				that.emit('data', cachedFile.contents);
				that.emit('end');
			} else {
				log.debug('file was modified since cached.');
				that.readFileFromDisk(stats.size, filepath);
			}	
		} else {
			that.readFileFromDisk(stats.size, filepath);
		}
	});
}

FileCache.prototype.readToCallback = function(filepath, callback) {
	var fileContent = '';
	var that = this;
	var data = function(data) {
		fileContent += data;
	}

	var end = function() {
		that.removeListener('data', data);
		that.removeListener('end', end);
		that.removeListener('error', error);
		callback(null, fileContent);
	}

	var error = function(err) {
		callback(err);
	}

	that.addListener('data', data);
	that.addListener('end', end);
	that.addListener('error', error);

	that.read(filepath);
}


FileCache.prototype.readFileFromDisk = function(fileSize, filepath) {
	var fileStream = fs.createReadStream(filepath);
	var that = this;
	var buff, shouldBuffer = false, buffPos = 0;

	if(fileSize <= MAX_SIZE) {
		buff = new Buffer(fileSize);
		shouldBuffer = true;
	}

	fileStream.addListener('data', function(data){
		that.emit('data', data);
		if(shouldBuffer) {
			data.copy(buff, buffPos);
			buffPos += data.length;
		}
	});

	fileStream.addListener('end', function() {
		that.emit('end');
		if(shouldBuffer) {
			that.addToCache(filepath, buff);
		}
	});

	fileStream.addListener('error', function(err) {
		that.emit('error', err);
	});
}

FileCache.prototype.addToCache = function(filepath, buff) {
	var timeStamp = (new Date()).getTime();
	var hash = crypto.createHash('md5');
	hash.update(filepath);
	var filenameHash = hash.digest('hex');
	cache[filenameHash] = {
		timeStamp : timeStamp,
		contents : buff
	}

	// extra simple expire cache, should be modified to prefer removeing the oldest item
	cacheList.push(filenameHash);
	if(cacheList > MAX_CACHE_SIZE) {
		delete cache[cacheList.pop()];
	}
}

module.exports = FileCache;
