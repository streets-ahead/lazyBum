var LBBase = require('./LBBase.js'),
	lb = require('./helpers/config'),
	lbLogger = require('./helpers/logger');

var log = new lbLogger(module);

var Hook = LBBase.extend(function() {
	Hook.super_.apply(this, arguments);
	this.hooks = [];
	this.pos = 0;
	this.pre = false;
});

Hook.HOOK_COMPLETE = "hookComplete";

Hook.prototype.nextHook = function() {
	this.pos++;
	log.trace("calling next hook");

	if(this.hooks.length > this.pos) {
		this.hooks[this.pos].run.call(this);
	} else {
		if(this.pre) {
			this.preHooksComplete();
		} else {
			this.postHookComplete();
		}
	}
};

Hook.prototype.execute = function(pre, hooks) {
	this.pre = pre;
	this.addListener(Hook.HOOK_COMPLETE, this.nextHook);

	var globalConfig = lb.getConfig();
	this.hooks = hooks;
	log.trace("executing hooks ", this.hooks);

	this.nextHook();
};

Hook.prototype.hookComplete = function () {
	log.trace("emitting hook complete");
	this.emit(Hook.HOOK_COMPLETE);
};

Hook.prototype.preHooksComplete = function () {
	this.emit(LBBase.LBEVENT, LBBase.PRECONTROLLER_COMPLETE, this.reqData);
};

Hook.prototype.postHookComplete = function () {
	this.emit(LBBase.LBEVENT, LBBase.POSTCONTROLLER_COMPLETE, this.reqData);
};

module.exports = Hook;

