var Ahead = function() {
	this.queue = [];
	this.running = false;
	this.lastDone = null;
}

Ahead.prototype.next = function(func) {
	var that = this;
	var done = function(payload) {
		this.lastDone = payload;
		if(that.queue.length > 0) {
			var nextFunc = that.queue.shift();
			nextFunc(done, payload);
		} else {
			that.running = false;
		}
	}

	if(!that.running) {
		func(done, this.lastDone);
		that.running = true;
	} else {
		this.queue.push(func);
	}

	return this;
}

module.exports = Ahead;


