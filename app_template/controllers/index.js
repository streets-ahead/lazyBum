var lazybum = require('lazyBum'),
	Controller = lazybum.get('Controller');
	
var logger = lazybum.getLogger(module);

var Welcome = Controller.extend(function() {
	Welcome.super_.apply(this, arguments);
});

module.exports = Welcome;

Welcome.prototype.index_get = function(urlParts, query) {
	this.writeResponse( { frameworkName : 'lazyBum' } );
};


