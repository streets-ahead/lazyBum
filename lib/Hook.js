var LBBase = require('./LBBase.js'),
	lb = require('./helpers/config'),
	lbLogger = require('./LBLogger');

var log = new lbLogger(module);

var Hook = LBBase.extend(function() {
	Hook.super_.apply(this, arguments);
	this.hooks = [];
	this.pos = 0;
	this.postEvent = '';
});

Hook.HOOK_COMPLETE = "hookComplete";

Hook.prototype.nextHook = function() {
	log.trace("calling next hook");

	if(this.hooks.length > this.pos) {
		this.hooks[this.pos].run.call(this);
	} else {
		this.emit(LBBase.LBEVENT, this.postEvent, this.reqData);
	}
};

Hook.prototype.execute = function(postEvent, hooks) {
	this.postEvent = postEvent;
	this.addListener(Hook.HOOK_COMPLETE, this.nextHook);

	var globalConfig = lb.getConfig();
	this.hooks = hooks;
	log.trace("executing hooks ", this.hooks);

	this.nextHook();
};

Hook.prototype.hookComplete = function () {
	log.trace("emitting hook complete");
	this.pos++;
	this.emit(Hook.HOOK_COMPLETE);
};

module.exports = Hook;

