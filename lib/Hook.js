var LBBase = require('LBBase.js'),
	lb = require('lbConfig'),
	lbLogger = require('lbLogger');

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
		this[this.hooks[this.pos]]();
	} else {
		if(this.pre) {
			this.preHooksComplete();
		} else {
			this.postHookComplete();
		}
	}
};

Hook.prototype.execute = function(pre) {
	this.pre = pre;
	this.addListener(Hook.HOOK_COMPLETE, this.nextHook);

	var globalConfig = lb.getConfig();
	if(this.pre) {
		this.hooks = globalConfig.preControllerHooks;
	} else {
		this.hooks = globalConfig.postControllerHooks;
	}
	log.trace("executing hooks ", this.hooks);

	if(this.hooks.length > this.pos) {
		this[this.hooks[this.pos]]();	
	}
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

