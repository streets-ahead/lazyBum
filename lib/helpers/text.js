exports.limitCharacters = function(body, length, endChar) {
	var out = '';
	if(body.length < length) {
		return body;
	} else {
		out = body.substring(0, length);
		var paragraph = out.search(/\n\n/);
		if(paragraph > 0) {
			out = out.substring(0, paragraph);
		} else {
			var i;
			for(i = length; i < body.length && body.charAt(i).match(/\s/) === null; i++) {
				out += body.charAt(i);
			}

			if(i < body.length) {
				out += endChar;
			}
		}
	}

	return out;
}

exports.replaceURLWithHTMLLinks = function(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp,"<a href='$1'>$1</a>"); 
}
