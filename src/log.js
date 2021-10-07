const debug = require('debug');
exports.logName = 'githubAuthGenerator';
exports.log = debug(exports.logName);
exports.setDebug = flag => {
  if (!flag) return;
  if (process.env.DEBUG) return;
  debug.enable(`${exports.logName},${exports.logName}:*`);
};
