var Renderer = require('../Renderer');

var json = Renderer.extend(function() {
	json.super_.apply(this, arguments);
});

module.exports = json;

json.prototype.render = function(obj) {
	var resultArray = [];
	if(obj && obj.constructor === Array) {
		if(obj.length > 0 && obj[0]['getDataObj']) {
			for(var i = 0; i < obj.length; i++) {
				resultArray.push(obj[i].getDataObj());
			}
			obj = resultArray;
		}
	}

	
	this.endResponse(JSON.stringify(obj));
}; 

json.CONTENT_TYPE = "application/json";