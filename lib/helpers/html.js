var config = require('./config'),
	stringUtils = require('./strings');

var globalConfig = config.getConfig();
var baseURL = globalConfig.baseURL + ':' + globalConfig.port + '/';

exports.createTitle = function(title) {
	return '<title>' + title + '</title>';
};

exports.createLink = function(address, text, target) {
	if(!address.startsWith('http://')) {
		var fullurl = baseURL + address;
	} else {
		fullurl = address;
	}
	var a = '<a href="' + fullurl + '"';
	if(target) {
		a += ' target="' + target + '"';
	}
	a += '>' + text + '</a>'
	return a;
};

exports.createImage = function(image, alt, height, width) {
	if(!image.startsWith('http://')) {
		var fullurl = baseURL + image;
	} else {
		fullurl = image;
	}
	var img = '<img src="' + fullurl + '"';
	if(alt) {
		img += ' alt="' + alt + '"';
	}

	if(height && width) {
		img += ' height="' + height + '" width="' + width + '"'; 
	}
	img += '>';

	return img;
};

exports.createStyle = function(stylesheet, rel) {
	if(!rel) {
		rel = 'stylesheet';
	}

	if(!stylesheet.startsWith('http://')) {
		var fullurl = "/" + stylesheet  //baseURL + stylesheet;
	} else {
		fullurl = baseURL + stylesheet;
	}
	return '<link rel="' + rel + '" type="text/css" media="screen" href="' + fullurl + '" />'
};

exports.createScript = function(script) {
	if(script.startsWith('http://')) {
		return '<script type="text/javascript" src="' + script + '"></script>';	
	} else {
		return '<script type="text/javascript" src="/' + script + '"></script>';	
	}
	
};

// TODO: currently only html5, should add more later
exports.createDoctype = function(version) {
	return "<!DOCTYPE html>";	
};

exports.createOL = function(items) {
	var out = '<ol>'
	for(var i=0; i<items.length; i++){
		out = out.concat('<li>' + items[i] + '</li>')
	}
	return out.concat('</ol>')
};

exports.createUL = function(items) {
	var out = '<ul>'
	for(i in items){
		out = out.concat('<li>' + items[i] + '</li>')
	}
	return out.concat('</ul>');
};

// TODO: takes an array of header values and builds a table with the provided data
exports.buildTable = function(header, data){
	
}



// exports.parseMarkdown = function(mdBody){
//  	return markdown.parse(mdBody);
// }
