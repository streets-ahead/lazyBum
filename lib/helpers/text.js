exports.limitCharacters = function(body, length, endChar) {
	var out = '';
	if(body.length < length) {
		return body;
	} else {
		out = body.substring(0, length);
		var i;
		for(i = length; i < body.length && body.charAt(i).match(/\s/) === null; i++) {
			out += body.charAt(i);
		}

		if(i < body.length) {
			out += endChar;
		}

	}

	return out;
}
