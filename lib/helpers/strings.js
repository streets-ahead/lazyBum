

String.prototype.endsWith = function(substr) {
	return (this.match(substr + "$") == substr);
};

String.prototype.startsWith = function(substr) {
	return (this.indexOf(substr) == 0);
};

var getFileName = function(pathname) {
	if(pathname.endsWith("/")) {
		pathname = pathname.substr(0, pathname.length - 1);
	}
	return pathname.substr(pathname.lastIndexOf('/') + 1);
};

var getBaseFilename = function(pathname) {
	var filename = getFileName(pathname);
	return filename.substr(0, filename.lastIndexOf('.'));
};

var getExtension = function(pathname) {
	var lastDotPos, filename = getFileName(pathname);
	if( (lastDotPos = filename.lastIndexOf('.')) > -1) {
		return filename.substr(lastDotPos + 1);
	} else {
		return null;
	}
};

exports.getFileName = getFileName;
exports.getBaseFilename = getBaseFilename;
exports.getExtension = getExtension;

