var config = require('./config'),
	stringUtils = require('./strings');

var globalConfig = config.getConfig();
var baseURL = globalConfig.baseURL + ':' + globalConfig.port + '/';

exports.createTitle = function(title) {
	return '<title>' + title + '</title>';
};

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
	return '<link rel="stylesheet" type="text/css" media="screen" href="' + baseURL + stylesheet + '" />'
};

exports.createScript = function(script) {
	if(script.startsWith('http://')) {
		return '<script type="text/javascript" src="' + script + '"></script>';	
	} else {
		return '<script type="text/javascript" src="' + baseURL + script + '"></script>';	
	}
	
};

// TODO: currently only html5, should add more later
exports.createDoctype = function(version) {
	return "<!DOCTYPE html>";	
};

// TODO: takes an array and returrns an html ordered list with the contents
exports.createOL = function(items) {
	
};

// TODO: takes an array and returrns an html unordered list with the contents
exports.createUL = function(items) {
	
};

// TODO: takes an array of header values and builds a table with the provided data
exports.buildTable = function(header, data){
	
}



// exports.parseMarkdown = function(mdBody){
//  	return markdown.parse(mdBody);
// }
