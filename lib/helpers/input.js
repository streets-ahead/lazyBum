var check = require('validator').check,
	sanitize = require('validator').sanitize,
	lbLogger = require('../LBLogger');	

var log = new lbLogger(module);
	
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
			if(obj === '') {
				return new Date();
			} else {
				return new Date(obj);
			}
		} else {
			return obj;
		}
	},
	'Bool' : function(obj) {
		return sanitize(obj).toBoolean();
	},
	'Email': function(obj) {
		return sanatize(obj.toString()).trim();
	},
	'Url' : function(obj) {
		return sanatize(obj.toString()).trim();
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
				valid = typeof(obj) === 'object' && (obj instanceof Date) && (obj.toString() !== 'Invalid Date');
				break;
			case 'Email':
				valid = typeof(obj) === 'string' && check(obj).isEmail();
				break;
			case 'Url':
				valid = typeof(obj) === 'string' && check(obj).isUrl();
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
	length: function(val, obj) {
		// TODO: support only max or only min
		return check(obj).len(val.min, val.max);
	},
	required: function(val, obj) {
		if(val) {
			return !(obj === null || (typeof(obj) === 'undefined') || obj.match(/^[\s\t\r\n]*$/));
		} else {
			return true;
		}
	},
	regex: function(val, obj) {
		return obj.match(val) !== null;
	}	
}


// TODO: might want to move this back to Collection, I'm not sure anymore if it belongs separate?
exports.validateObject = function(obj, template) {
	var valid = true
	var finalValid = true
	for(var field in template) {
		for(var constraint in template[field]) {
			log.trace('validating ' + constraint);
			var validator = contraintValidators[constraint];
			if(validator) {
				valid = validator(template[field][constraint], obj[field]);
				if(!valid) {
					if(obj.addError) {
						obj.addError(field + '.' + constraint);
					}
					break;
				}
			}
		}
		
		if(!valid) {
			finalValid = false;
		}
	}
	
	return finalValid;
}

exports.xssSanitize = function(str) {
	return sanitize(str).xss();
}

exports.typeConverters = typeConverters;
exports.contraintValidators = contraintValidators;