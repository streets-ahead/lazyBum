var emitter = require('events').EventEmitter,
	logger = require('../LBLogger');

var log = new logger(module);

var Ahead = function() {
	this.queue = [];
	this.running = false;
	this.lastDone = null;
}

Ahead.prototype = new emitter();

Ahead.prototype.next = function(func) {
	var that = this;
	debugger;
	var done = function(args, err) {
		debugger;
		that.lastDone = args;
		if(that.queue.length > 0) {
			try {
				var nextFunc = that.queue.shift();
				nextFunc.call(that, done, args, err);
			} catch(e) {
				log.error(e.stack);
				nextFunc(null, e);
				that.emit('ERROR', e);
			}
		} else {
			that.running = false;
		}
	}

	if(!that.running) {
		try {
			that.running = true;
			func(done, this.lastDone);
		} catch(e) {
			log.error(e.stack);
			done(null, e);
			that.emit('ERROR', e);
		}
	} else {
		this.queue.push(func);
	}

	return this;
}

Ahead.prototype.clearQueue = function() {
	this.queue = [];
	this.running = false;
	this.lastDone = null;
}

module.exports = Ahead;


