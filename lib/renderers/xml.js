var Renderer = require('../Renderer'),
	lbLogger = require('../helpers/logger');

var log = new lbLogger(module);

var xml = Renderer.extend(function() {
	xml.super_.apply(this, arguments);
});

module.exports = xml;

xml.CONTENT_TYPE = "application/xml";

xml.prototype.render = function(obj) {
	/*	This work is licensed under Creative Commons GNU LGPL License.

		License: http://creativecommons.org/licenses/LGPL/2.1/
	   Version: 0.9
		Author:  Stefan Goessner/2006
		Web:     http://goessner.net/ 
	*/

	var toXml = function(v, name, ind) {
	   var xml = "";
	   if(name.startsWith('$') || name.startsWith('_')) {
	   			name = name.substr(1);
	   		}

	   if (v instanceof Array) {
	      for (var i=0, n=v.length; i<n; i++)
	         xml += ind + toXml(v[i], name, ind+"\t") + "\n";
	   } else if (typeof(v) === 'function') {
	   	
	   } else if (typeof(v) == "object") {
	      var hasChild = false;
	      xml += ind + "<" + name;
	      for (var m in v) {
	         if (m.charAt(0) == "@")
	            xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
	         else
	            hasChild = true;
	      }
	      xml += hasChild ? ">" : "/>";
	      if (hasChild) {
	         for (var m in v) {
	            if (m == "#text")
	               xml += v[m];
	            else if (m == "#cdata")
	               xml += "<![CDATA[" + v[m] + "]]>";
	            else if (m.charAt(0) != "@")
	               xml += toXml(v[m], m, ind+"\t");
	         }
	         xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
	      }
	   }
	   else {
	   		
	      xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
	   }
	   return xml;
	}, xml='<?xml version="1.0"?>\n<obj2xml>';

	for (var m in obj) {
		log.trace('converting to xml', obj);
	   xml += toXml(obj[m], m, "");
	}
	xml += '</obj2xml>';

	this.endResponse(xml);
};
