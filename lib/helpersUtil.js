fs = require('fs');

var filedir = __filename.substring(0, __filename.indexOf('/helpersUtil.js'));
module.exports.rootHelpers = fs.readdirSync(filedir + '/helpers');
module.exports.localHelpers = fs.readdirSync(process.cwd() + '/helpers');


