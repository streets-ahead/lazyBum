var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	util = require('util'),
	querystring = require('querystring'),
	path = require('path'),

	session = require('./helpers/session'),	
	lbConfig = require('./helpers/config'),
	stringUtils = require('./helpers/strings'),
	LBBase = require('./LBBase'),
	Router = require('./Router'),
	FileServer = require('./FileServer'),
	Hook = require('./Hook'),
	lbLogger = require('./LBLogger');

var RestServer = function() {
	// constructor 	
		var that = this;

		log = new lbLogger(module);
			
		that.controllers = {};
		that.renderers = {};
		that.collections = {};

		that.preControllerHooks = [];
		that.postControllerHooks = [];

		that.options = lbConfig.getConfig();
		var lbFile = __filename;
		that.moduleDir = lbFile.substring(0, lbFile.indexOf('/lazyBum.js'));
		
		that.server = http.createServer(function(request, response) {
			var requestData = {
				request: request,
				response: response,
				url: url.parse(request.url),
				finished: false,
				headers: [],
				lazyBum: that,
				startTime: new Date().getTime()	
			};
			
			log.access(request, requestData.url.pathname);
			log.info("received request for " + requestData.url.pathname);
			
			    //bad stuff but better than before    
			var errHandler = function(err) {
			    handleGlobalError(err, requestData.request, requestData.response, errHandler);
			}
			requestData.errorHandler = errHandler;
			process.on('uncaughtException', errHandler);
			
			if(that.options.sessionsEnabled) {
				session.initSession(requestData);
			}

			if(request.method === 'POST' || request.method === 'PUT') {
				parsePostData(requestData, function() {
					didReceiveLBEvent(LBBase.INIT_COMPLETE, requestData);
				});
			} else {
				didReceiveLBEvent(LBBase.INIT_COMPLETE, requestData);
			}
		});

	// end

	var handleGlobalError = function(err, request, response, handler) {
		process.removeListener('uncaughtException', handler);
		
		log.error(err.stack);
		var excep = util.inspect(err, true, null);	
		response.writeHead(500, {'Content-Type':'text/html'});
		response.write(err.message);
		response.end("<pre>" + err.stack + "</pre>");
		reqData.finished = true;
	};
	
	that.startServer = function() {
		process.setMaxListeners(0);
		loadControllers();
		loadRenderers();
		loadCollections();
		Hook.prototype.helpers = [];
		Hook.prototype.collections = [];
		loadHooks(that.options.preControllerHooks, that.preControllerHooks);
		loadHooks(that.options.postControllerHooks, that.postControllerHooks);

		that.server.listen(that.options.port);
		log.info("lazybum is listening on " + that.options.port);
	};

	var parsePostData = function(reqData, callback) {
		log.trace("parsing POST data");
		var bodyStr = '';
		
		reqData.request.on('data', function(chunk) {
			bodyStr += chunk.toString();
		});

		reqData.request.on('end', function () {
			log.trace('END data from post');
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
		try {
			preHooks.execute(LBBase.PRECONTROLLER_COMPLETE, that.preControllerHooks);
		} catch(e) {
			callError(reqData, e);
		}
	};

	var executePostControllerHooks = function(reqData, args) {
		log.trace("executing postcontroller hooks");
		var postHooks = new Hook(reqData);
		postHooks.addPrimaryListener(didReceiveLBEvent);
		try {
			postHooks.execute(LBBase.POSTCONTROLLER_COMPLETE, that.postControllerHooks);
	 	} catch(e) {
			callError(reqData, e);
		}
	};
	
	var checkFile = function(reqData) {
		var filename = path.join(process.cwd() + lbConfig.getConfig().templateDir + '/assets', reqData.url.pathname);
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
		
		process.removeListener('uncaughtException', reqData.errorHandler);

		if(data) {
			log.trace('finished response with data');
			reqData.response.end(data);
			reqData.finished = true;
		} else {
			log.trace('finished response');
			reqData.response.end();
			reqData.finished = true;
		}

		var t = new Date().getTime() - reqData.startTime;
		log.info('execution time: ' + t + ' for ' + reqData.url.pathname);
	};

	var writeHead = function(reqData) {
		if(!reqData.sentHeaders) {
			var responseCode = reqData.responseCode ? reqData.responseCode : 200;
			
			if(reqData.headers) {	
				log.trace('custom headers');
				reqData.response.writeHead(responseCode, reqData.headers);
			} else {
				reqData.response.writeHead(responseCode);
				log.trace('default headers');
			}
			reqData.sentHeaders = true;
		}
	};

	var didPostRedirect = function(reqData, args) {
		process.removeListener('uncaughtException', reqData.errorHandler);
		var newURL = args[0];
		if(!newURL.startsWith('/') && !newURL.startsWith('http')) {
			newURL += '/' + newURL;
		} 

		log.trace(newURL);
		reqData.headers.push(['Location', newURL]);
		reqData.response.writeHeader(302, reqData.headers);
		reqData.response.end();
		reqData.finished = true;
	};

	var didReceiveError = function(reqData, args) {
		process.removeListener('uncaughtException', reqData.errorHandler);
		log.trace(args);
		var message = args[1];
		reqData.responseCode = args[0];
		reqData.response.setHeader('Content-Type', "text/plain");
		log.trace("an error was recieved " + reqData.responseCode + " with message " + message );
		writeHead(reqData);
		reqData.response.end(message);
		reqData.finished = true;
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
		
		reqData.headers.push(["Content-Type", rendererClass.CONTENT_TYPE]); 
		if(args[1]) {
			reqData.responseCode = args[1];
		}

		var templateName;
		if(!args[3]) {
			log.trace('template name: ' + getControllerName(reqData.url.pathname.split('/').slice(1)).controllerName);
			templateName = getControllerName(reqData.url.pathname.split('/').slice(1)).controllerName;
		} else {
			templateName = args[3];
		}

		try {
			renderer.render(args[0], args[2], stringUtils.getBaseFilename(templateName));
		} catch (e) {
			callError(reqData, e);
		}
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
	
	var loadCollections = function() {
		var collectionFiles = fs.readdirSync(process.cwd() + '/collections');
		
		for (var i = 0; i < collectionFiles.length; i++) {
			var file = collectionFiles[i];
			if(!file.startsWith('.')) {
				var fileName = file.substr(0, file.lastIndexOf('.'));
				log.trace("found collection " + fileName);
				console.log(process.cwd() + "/collections/" + fileName)
				var colClass = require(process.cwd() + "/collections/" + fileName);
				that.collections[fileName] = colClass;
			}
		}
	}
	
	that.getCollectionClass = function(name) {
		return that.collections[name];
	}

	var load = function(type) {
		var collection = {};
		var myFiles = fs.readdirSync(process.cwd() + "/" + type);
		
		try {
			var coreFiles = fs.readdirSync(that.moduleDir + "/" + type);

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
		} catch(e) {
			log.trace('there is no core directory for this type, this is probably not an issue.');
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
					addToHook('collections', hookModule);
					addToHook('helpers', hookModule);
					hooksImplCollection.push( hookModule );
				}
			});
		}
	};
	
	var addToHook = function(type, hookModule) {
		if(hookModule[type]) {
			for(var c in hookModule[type]) {
				if(Hook.prototype[type].indexOf(c) === -1) {
					log.trace('Adding ' + type + ' ' + hookModule[type][c]);
					Hook.prototype[type].push(hookModule[type][c]);
				}
			}
		}
	}
	
	var executeController = function(reqData) {
		var defaultController = that.options.defaultController;

		var realPath = reqData.url.pathname.removeTrailingSlash();
		log.trace('realpath ' + realPath);
		var pathParts = realPath.split('/');
		pathParts.shift();
		
		removeExtension(pathParts);

		var controllerNameObj = getControllerName(pathParts);
		var controllerName = controllerNameObj.controllerName;
		pathParts = controllerNameObj.pathParts;

		var httpMethod = reqData.request.method.toLowerCase();	
		var controllerClass = that.controllers[controllerName];
		var controller = null;
		
		if	(!controllerClass) { //Controller does not exist use default
			controllerClass = that.controllers[defaultController]
			pathParts = realPath.split('/'); //TODO: revisit - recreate pathparts from url
			pathParts.shift();
		}

		if(controllerClass) {
			controller = new controllerClass(reqData);
			controller.addPrimaryListener(didReceiveLBEvent);
		}

		var getMethodObj = getMethod(pathParts, controller, httpMethod);
		var method = getMethodObj.methodName;
		pathParts = getMethodObj.pathParts;
		
		log.trace("executing controller " + controllerName + " and method " + method);

		if(controller && controller[method]) {
 			var data = querystring.parse(reqData.postData)
			var query = querystring.parse(reqData.url.query);
			try {
				var controllerResponse = controller[method](pathParts, query, data);
			} catch(e) {
				callError(reqData, e);
			}
		} else {
			notFound(reqData);
		}
	};
	
	var callError = function(reqData, e) {
		log.error(e.message);
		log.error(e.stack);
		didReceiveError(reqData, [500, 'An error occurred.\n' + e.message]);
	}

	var removeExtension = function(pathParts) {
		var lastPart = pathParts[pathParts.length - 1];
		if(lastPart && lastPart.lastIndexOf('.') > -1) {	
			pathParts[pathParts.length - 1] = stringUtils.getBaseFilename(lastPart);
		}
	}

	var notFound = function(reqData, args) {
		log.trace("returning 404 not found");
		var responseCode = 404;
		if(args && args.length > 1) {
			responseCode = args[0];
		}

		reqData.response.writeHead(responseCode, {'Content-Type':'text/html'});
		reqData.response.end("File not found, looser");	
		reqData.finished = true;
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

var getLocal = function(str){
	try{
		return require(process.cwd() + '/' + str)
	}catch(err){
		return require('./' + str);
	}
}
var getParent = function(str){
  return require('./' + str)
}

exports.getHelper = function(str) {
	return getLocal('helpers/' + str);
}

exports.getRenderer = function(str, parent) {
  if(parent){ return getParent('renderers/' + str); }
	else{ return getLocal('renderers/' + str); }
}

exports.getLogger = function(mod) {
	return new lbLogger(mod);
}





