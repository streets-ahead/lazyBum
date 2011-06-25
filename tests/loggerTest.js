require.paths.unshift(process.cwd() + "/lib");
var lbLogger = require('lbLogger');


var log = new lbLogger(module);

log.debug('test');
log.error('terry sucks');
// log.warn('I am awesome')



