var check = require('validator').check,
	sanitize = require('validator').sanitize;

// TODO: add type converters for each supported type
var typeConverters = {
	String : function(obj) {
		if(obj){ 
			return obj.toString() 
		}
		else { 
			return null; 
		}
	},
	'Int' : function(obj) {
		return sanitize(obj).toInt();
	},
	'Float' : function(obj) {
		return sanitize(obj).toFloat();
	},
	'Date' : function(obj) {
		if(typeof obj === 'string') {
			return new Date(obj);
		} else {
			return obj;
		}
	},
	'Bool' : function(obj) {
		return sanitize(obj).toBoolean();
	}
}

var contraintValidators = { 
	type : function(val, obj) {
		var valid = true;
		switch(val) {
			case 'String':
				valid = typeof(obj) === 'string';
			  	break;
			case 'Int':
					valid = (obj !== undefined) && (obj.toString().match(/^(?:-?(?:0|[1-9][0-9]*))$/) !== null);
			  	break;
			case 'Float':
				valid = obj.toString().match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/) !== null;
			  	break;
			case 'Array':
				valid = typeof(obj) === 'object' && (obj instanceof Array);
			  	break;
			case 'Object':
			  	valid = typeof(obj) === 'object';
				break;
			case 'Bool':
				valid = typeof(obj) === 'boolean';
				break;
			case 'Date':
				valid = typeof(obj) === 'object' && (obj instanceof Date);
				break;
			default:
				log.error('Invalid type value in schema model ' + val);
				valid = false;
		}
	
		if((typeof(obj) === 'undefined') || obj === null) {
			valid = true;
		}
	
		return valid;
	},
	length : function(val, obj) {
		// TODO: support only max or only min
		return check(obj).len(val.min, val.max);
	},
	validateEmail : function(val, obj) {
		if(val) {
			return check(obj).isEmail();
		} else {
			return true;
		}
	},
	required : function(val, obj) {
		if(val) {
			return !(obj === null || (typeof(obj) === 'undefined') || obj.match(/^[\s\t\r\n]*$/));
		} else {
			return true;
		}
	},
	regex : function(val, obj) {
		return obj.match(val) !== null;
	}	
}

exports.validateObject = function(obj, template) {
	var valid = true
	for(var field in template) {
		for(var constraint in template[field]) {
			var validator = contraintValidators[constraint];
			if(validator) {
				valid = validator(template[field][constraint], obj[field]);
				if(!valid) {
					this.errorMessage = "failed to pass constraint " + constraint;
					break;
				}
			}
		}
		
		if(!valid) {
			break;
		}
	}
	
	return valid;
}

exports.xssSanitize = function(str) {
	return sanitize(str).xss();
}

exports.typeConverters = typeConverters;
exports.contraintValidators = contraintValidators;