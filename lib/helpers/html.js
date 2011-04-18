var config = require('./config');

var globalConfig = config.getConfig();
var baseURL = globalConfig.baseURL + ':' + globalConfig.port + '/';

exports.createLink = function(address, text, target) {
	var a = '<a href="' + baseURL + address + '"';
	if(target) {
		a += ' target="' + target + '"';
	}
	a += '>' + text + '</a>'
	return a;
};

exports.createImage = function(image, alt, height, width) {
	var img = '<img src="' + baseURL + image + '"';
	if(alt) {
		img += ' alt="' + alt + '"';
	}

	if(height && width) {
		img += ' height="' + height + '" width="' + width + '"'; 
	}
	img += '>';

	return img;
};

exports.createStyle = function(stylesheet) {
	
};


exports.createScript = function(script) {
	
};

// currently only html5, should add more later
exports.createDoctype = function(version) {
	return "<!DOCTYPE html>";	
};

// takes an array and returrns an html ordered list with the contents
exports.createOL = function() {
	
};

// takes an array and returrns an html unordered list with the contents
exports.createUL = function(items) {
	
};
