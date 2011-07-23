#!/usr/bin/env node

var exec = require('child_process').exec,
	fs = require('fs'),
	Hobo = require('../lib/Hobo');

var lbFile = __filename;
var moduleDir = lbFile.substring(0, lbFile.indexOf('bin/lazybum.js'));
console.log(lbFile);

// maybe should be done using node fs commands, but this seems easier for now
var copyDir = function(fileName) {
	createPackageJson();
	
	child = exec('cp -R ' + fileName + " " + process.cwd(), function (error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log("Initialized lazyBum project, have fun bummin' ...\n");
		}
	});
}

var createPackageJson = function() {
	var realPath = fs.realpathSync(process.cwd());
	var projectName = realPath.substring(realPath.lastIndexOf('/')+1);
	
	console.log("Creating package.json file...");
	writer = fs.createWriteStream(process.cwd() + '/package.json', {flags:'a'});

	hobo = Hobo.getInstance();
	hobo.on('data', function(data) {
		writer.write(data);
	});
	hobo.on('end', function() {
		writer.end();
	});

	hobo.render('package.json', {'projectname' : projectName}, moduleDir + 'class_templates/');
}

var buildModelSandbox = function(args){
	var fields = []
	for(var i=2; i<args.length; i++){
		fields.push(args[i])
	}

	var sandbox = {
		"objectName" : args[0],
		"collectionName" : args[1],
		"requiredFields" : fields
	}

	return sandbox;
}

var buildControllerSandbox = function(args){
	var sandbox = {
		"objectName" : args[0],
		"modelName" : args[1]
	}

	return sandbox;
}

var runTests = function() {
	process.on('uncaughtException', function(e) {
		console.log(e.message);
		console.log(e.stack);
	})
	
	var files = fs.readdirSync(process.cwd() + '/tests');
	console.log('Finding tests in ' + process.cwd() + '/tests');
	for(var i = 0; i < files.length; i++) {
		var testClass = require(process.cwd() + '/tests/' + files[i]);
		var test = new testClass();
		console.log('Running tests for ' + files[i]);
		for(var prop in test) {
			if(typeof test[prop] === 'function' && prop.indexOf('test') === 0) {
				console.log('       Running ' + prop);
				if(test.setUp){
					test.setUp();
				}
			
				test[prop]();
				
				if(test.tearDown) {
					test.tearDown();
				}
			}
		}
		
		if(test.done) {
			test.done();
		}
	} 
}

var create = function() {
	var sandbox;
	if(process.argv.length > 4) {
		var type = process.argv[3];
		var name = process.argv[4];
		var fields = []

		switch(type){
			case 'controller':
				sandbox = buildControllerSandbox(process.argv.slice(4));
				break;
			case 'collection':
				sandbox = buildModelSandbox(process.argv.slice(4));
				break;
			default:
				showHelp();
				return;
		}


		console.log("Creating " + type + " " + name);
		writer = fs.createWriteStream(process.cwd() + '/' + type +  's/' + name + ".js", {flags:'a'});

		hobo = Hobo.getInstance();
		hobo.on('data', function(data) {
			writer.write(data);
		});
		hobo.on('end', function() {
			writer.end();
		});

		hobo.render(type, sandbox, moduleDir + 'class_templates/');
	} else {
		showHelp();
	}
}

var showHelp = function() {
	console.log("Type lazybum init to initialize this project.");
	process.exit();
}

var accepts = ['init', 'create', 'run-tests'], action;

if (accepts.indexOf(process.argv[2]) !== -1) {
	action = process.argv[2];
console.log('Performing action ' + action);
	switch(action){
		case "init":
			copyDir(moduleDir + "app_template/*");
			break;
		case "create":
			create();
			break;
		case "run-tests":
			runTests()
			break;
		case "help":
			showHelp();
			break;
	}
		
} else {
	showHelp();
}
