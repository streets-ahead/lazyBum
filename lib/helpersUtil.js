fs = require('fs');

var filedir = __filename.substring(0, __filename.indexOf('/helpersUtil.js'));
module.exports.rootHelpers = fs.readdirSync(filedir + '/helpers');
console.log(module.exports.rootHelpers);
module.exports.localHelpers = fs.readdirSync(process.cwd() + '/helpers');
console.log(module.exports.localHelpers);

