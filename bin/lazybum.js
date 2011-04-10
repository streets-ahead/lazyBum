#!/usr/bin/env node

var exec = require('child_process').exec,
	fs = require('fs'),
	Hobo = require('lazyBum/lib/Hobo');

var lbFile = require.resolve('lazyBum');
var moduleDir = lbFile.substring(0, lbFile.indexOf('lib/lazyBum.js'));

// maybe should be done using node fs commands, but this seems easier for now
var copyDir = function(fileName) {
	child = exec('cp -R ' + fileName + " " + process.cwd(), function (error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		} else {
			console.log("Initialized lazyBum project, have fun bummin' ...\n");
		}
	});
}

var create = function() {
	console.log(process.argv);
	if(process.argv.length > 4) {
		var type = process.argv[3];
		var name = process.argv[4];
		console.log("Creating " + type + " " + name);
		writer = fs.createWriteStream(process.cwd() + '/controllers/' + name + ".js", {flags:'a'});

		var sandbox = {
			"objectName" : name
		}	

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

var accepts = ['init', 'create'], action;
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
		case "help":
			showHelp();
			break;
	}
		
} else {
	showHelp();
}
