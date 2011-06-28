var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	util = require('util'),
	
	lbConfig = require('./helpers/config'),
	stringUtils = require('./helpers/strings'),
	LBBase = require('./LBBase'),
	Router = require('./Router'),
	FileServer = require('./FileServer'),
	Hook = require('./Hook'),
	lbLogger = require('./LBLogger');

var RestServer = function() {
	// constructor {	
		var that = this;

		log = new lbLogger(module);
			
		that.controllers = {};
		that.renderers = {};

		that.preControllerHooks = [];
		that.postControllerHooks = [];

		that.options = lbConfig.getConfig();
		var lbFile = __filename;
		that.moduleDir = lbFile.substring(0, lbFile.indexOf('/lazyBum.js'));

	// }

	var handleGlobalError = function(err, request, response) {
		log.error(err.stack);
		var excep = util.inspect(err, true, null);
		response.writeHead(500, {'Content-Type':'text/html'});
		response.write(err.message);
		response.end("<pre>" + err.stack + "</pre>");
	};

	that.startServer = function() {
		loadControllers();
		loadRenderers();
		loadHooks(that.options.preControllerHooks, that.preControllerHooks);
		loadHooks(that.options.postControllerHooks, that.postControllerHooks);

		that.server = http.createServer(function(request, response) {
			var requestData = {
				"request" : request,
				"response" : response,
				"url" : url.parse(request.url)	
			};

			log.access(request, requestData.url.pathname);
			log.info("received request for " + requestData.url.pathname);
			
			parsePostData(requestData, function() {
				didReceiveLBEvent(LBBase.INIT_COMPLETE, requestData);
			});
		});

		that.server.listen(that.options.port);
		log.info("lazybum is listening on " + that.options.port);
	};

	var parsePostData = function(reqData, callback) {
		log.trace("parsing POST data");
		var bodyStr = '';
		
		reqData.request.on('data', function(chunk) {
			log.debug('getting data from post... ' + chunk);
			bodyStr += chunk.toString();
		});

		reqData.request.on('end', function () {
			log.debug('END data from post');
			reqData.postData = bodyStr;
			callback();
		});
	};

	var didReceiveLBEvent = function (event, reqData, args) {
		log.trace("received lb event " + event + " with " + reqData);
		flow[event](reqData, args);
	};
	
	var route = function(reqData) {
		var router = new Router(reqData);
		router.addPrimaryListener(didReceiveLBEvent);
		router.route(reqData.url);
	};

	var executePreControllerHooks = function(reqData, args) {
		log.trace("executing precontroller hooks");
		var preHooks = new Hook(reqData);
		preHooks.addPrimaryListener(didReceiveLBEvent);
		preHooks.execute(true, that.preControllerHooks);
	};

	var executePostControllerHooks = function(reqData, args) {
		log.trace("executing postcontroller hooks");
		var postHooks = new Hook(reqData);
		postHooks.addPrimaryListener(didReceiveLBEvent);
		postHooks.execute(false, that.postControllerHooks);
	};
	
	var checkFile = function(reqData) {
		var filename = path.join(process.cwd() + "/public/", reqData.url.pathname);
		log.trace("checking for file " + filename);

		path.exists(filename, function(exists) {
			if(exists) {
				didReceiveLBEvent(LBBase.FILE_FOUND, reqData, [filename]);
			} else {
				didReceiveLBEvent(LBBase.FILE_NOT_EXISTS, reqData);
			}
		} );
	};

	var hasResponseData = function(reqData, args) {
		log.trace("sending data...");
		var data = args[0];
		writeHead(reqData);

		if(data) {
			reqData.response.write(data);
		}
	};

	var didResponseEnd = function(reqData, args) {
		log.trace("response end ");
		var data = args[0];

		writeHead(reqData);

		if(data) {
			reqData.response.end(data);
		} else {
			reqData.response.end();
		}
	};

	var writeHead = function(reqData) {
		if(!reqData.sentHeaders) {
			var responseCode = reqData.responseCode ? reqData.responseCode : 200;
			if(reqData.headers) {	
				log.info('custom headers');
				log.trace(reqData.headers);
				reqData.response.writeHead(responseCode, reqData.headers);
			} else {
				reqData.response.writeHead(responseCode);
				log.trace('default headers');
			}
			reqData.sentHeaders = true;
		}
	};

	var didPostRedirect = function(reqData, args) {
		var newURL = args[0];
		newURL = newURL.startsWith('/') ? newURL.substr(1) : newURL;
		log.trace(that.options.baseURL + ':' + that.options.port + newURL);
		reqData.response.writeHeader(302, {'Location' : that.options.baseURL + ':' + that.options.port + '/' + newURL});
		reqData.response.end();
	};

	var didReceiveError = function(reqData, args) {
		log.trace(args);
		var message = args[1];
		reqData.responseCode = args[0];
		reqData.response.setHeader('Content-Type', "text/plain");
		log.trace("an error was recieved " + reqData.responseCode + " with message " + message );
		writeHead(reqData);
		reqData.response.end(message);
	};

	var controllerComplete = function(reqData, args) {
		var format = stringUtils.getExtension(reqData.url.pathname);
		
		var file;
		if(!format) {
			format = that.options.defaultRenderer;
		} 

		log.trace('loading renderer for ' + format);
		var rendererClass = that.renderers[format];
		var renderer = new rendererClass(reqData);
		renderer.addPrimaryListener(didReceiveLBEvent);
		
		if(!reqData.headers) {
			reqData.headers = {};
		}
		
		reqData.headers["Content-Type"] = rendererClass.CONTENT_TYPE; 
		if(args[1]) {
			reqData.responseCode = args[1];
		}

		var templateName;
		if(!args[3]) {
			templateName = getControllerName(reqData.url.pathname.split('/').slice(1)).controllerName;
		} else {
			templateName = args[3];
		}

		renderer.render(args[0], args[2], templateName);
	};

	var serveFile = function(reqData, args) {
		var filename = args[0];
		log.trace("serving file " + filename);
		var fileServer = new FileServer(reqData);
		fileServer.addPrimaryListener(didReceiveLBEvent);
		fileServer.serve(filename);
	};
	
	var loadControllers = function() {
		that.controllers = load('controllers');
	};

	var loadRenderers = function() {
		that.renderers = load('renderers');
	};

	var load = function(type) {
		collection = {};
		myFiles = fs.readdirSync(process.cwd() + "/" + type);
		coreFiles = fs.readdirSync(that.moduleDir + "/" + type);

		for(var i = 0; i < coreFiles.length; i++) {
			var file = coreFiles[i];
			if(myFiles.indexOf(file) < 0) {
				if(!file.startsWith('.')) {
					var fileName = file.substr(0, file.lastIndexOf('.'));
					log.trace("found core " + type + " " + fileName);
					collection[fileName] = require("./" + type + "/" + fileName);
				}
			}
		}

		for(var i = 0; i < myFiles.length; i++) {
			var file = myFiles[i];
			if(!file.startsWith('.')) {
				var fileName = file.substr(0, file.lastIndexOf('.'));
				log.trace("found " + type + " " + fileName);
				collection[fileName] = require(process.cwd() + "/" + type + "/" + fileName + ".js");
			}
		}

		return collection;
	};

	var loadHooks = function(hooksCollection, hooksImplCollection) {
		for(var i = 0; i < hooksCollection.length; i++) {
			var hookName = hooksCollection[i];
			var filename = path.join(process.cwd() + "/hooks/", hookName + ".js");
			path.exists(filename, function(exists) {
				if(exists) {
					var dotPos = hookName.lastIndexOf('.');
					var hook = dotPos > -1 ? hookName.substr(0, dotPos) : hookName;
					log.trace("found hook " + hook);
					var hookModule = require(process.cwd() + "/hooks/" + hook + ".js");
					hooksImplCollection.push( hookModule );
				}
			});
		}
	};
	
	var executeController = function(reqData) {
		//bad stuff but better than before	
			var errHandler = function(err) {
				handleGlobalError(err, reqData.request, reqData.response);
			}
			process.on('uncaughtException', errHandler);

			setTimeout(function() {
				process.removeListener('uncaughtException', errHandler);	
			}, 3000);	

		var pathParts = reqData.url.pathname.split('/');
		pathParts.shift();
		
		removeExtension(pathParts);

		var controllerNameObj = getControllerName(pathParts);
		var controllerName = controllerNameObj.controllerName;
		pathParts = controllerNameObj.pathParts;

		var httpMethod = reqData.request.method.toLowerCase();	
		var controllerClass = that.controllers[controllerName];
		
		var controller = null;
		if	(controllerClass) {
			controller = new controllerClass(reqData);
			controller.addPrimaryListener(didReceiveLBEvent);
		}

		var getMethodObj = getMethod(pathParts, controller, httpMethod);
		var method = getMethodObj.methodName;
		pathParts = getMethodObj.pathParts;

		log.trace("executing controller " + controllerName + " and method " + method);

		if(controller && controller[method]) {
			var controllerResponse = controller[method](pathParts, reqData.url.query, reqData.postData);
		} else {
			notFound(reqData);
		}
	};

	var removeExtension = function(pathParts) {
		var lastPart = pathParts[pathParts.length - 1];
		if(lastPart.lastIndexOf('.') > -1) {	
			pathParts[pathParts.length - 1] = stringUtils.getBaseFilename(lastPart);
		}
	}

	var notFound = function(reqData, args) {
		log.trace("returning 404 not found");
		var responseCode = 404;
	// TODO: do something here
		if(args && args.length > 1) {
			responseCode = args[0];
		}

		reqData.response.writeHead(responseCode, {'Content-Type':'text/html'});
		reqData.response.end("File not found, looser");	
	};

	var getControllerName = function(pathParts) {
		return {'controllerName' : pathParts[0], 'pathParts' : pathParts.slice(1)};
	}

	var getMethod = function(pathParts, controller, httpMethod) {
		var method;
		if(pathParts[0] && controller && controller[pathParts[0] + "_" + httpMethod]) {
			method = {'methodName' : pathParts[0] + "_" + httpMethod, 'pathParts' : pathParts.slice(1)};
		} else {
			method = {'methodName' : "index_" + httpMethod, 'pathParts' : pathParts};
		}
		
		return method;
	};


	var flow = {};
	flow[LBBase.INIT_COMPLETE] 			= route;
	flow[LBBase.ROUTING_COMPLETE] 		= executePreControllerHooks;
	flow[LBBase.PRECONTROLLER_COMPLETE] = checkFile;
		flow[LBBase.FILE_FOUND] 			= serveFile;
		flow[LBBase.FILE_NOT_EXISTS] 		= executeController;
	flow[LBBase.CONTROLLER_COMPLETE] 	= controllerComplete;
	flow[LBBase.HAS_DATA] 				= hasResponseData;
	flow[LBBase.RESP_COMPLETE] 			= didResponseEnd;
	
	flow[LBBase.REDIRECT] = didPostRedirect;

	flow[LBBase.ERROR] = didReceiveError;
	flow[LBBase.NOT_FOUND] = notFound;
}

exports.RestServer = RestServer;


var getReq = function(str) {
	return require('./' + str);
};

exports.get = getReq;

exports.getHelper = function(str) {
	return getReq('helpers/' + str);
}

exports.getRenerer = function(str) {
	return getReq('renderers/' + str);
}

exports.getModel = function(str) {
	return getReq('collections/' + str);
}






