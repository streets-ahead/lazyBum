var emitter = require('events').EventEmitter;

var Ahead = function() {
	this.queue = [];
	this.running = false;
	this.lastDone = null;
}

Ahead.prototype = new emitter();

Ahead.prototype.next = function(func) {
	var that = this;
	var done = function(args, err) {
		this.lastDone = args;
		if(that.queue.length > 0) {
			try {
				var nextFunc = that.queue.shift();
				nextFunc.call(that, done, args, err);
			} catch(e) {
				that.emit('ERROR', e);
			}
		} else {
			that.running = false;
		}
	}

	if(!that.running) {
		try {
			func(done, this.lastDone);
			that.running = true;
		} catch(e) {
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


