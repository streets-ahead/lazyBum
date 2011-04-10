var Renderer = require('../Renderer');

var json = Renderer.extend(function() {
	json.super_.apply(this, arguments);
});

module.exports = json;

json.prototype.render = function(obj) {
	this.endResponse(JSON.stringify(obj));
}; 

json.CONTENT_TYPE = "application/json";