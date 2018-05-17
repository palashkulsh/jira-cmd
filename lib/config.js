/*global path, define*/
define([
  'path'
], function (path) {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

  return {
    cfgPath: getCfgPath(),
	cfgFilePath: path.join(getCfgPath(), 'config.json'),
	cacheFilePath: path.join(getCfgPath(), 'cache.json'),
    auth: {},
    options: {}
  };

  function getCfgPath () {
    var systemHomePath;
    if (process.platform == 'win32') {
      systemHomePath = process.env['HOMEDRIVE'] + process.env['HOMEPATH'];
    } else {
      systemHomePath = process.env['HOME'];
    }
	return path.join(systemHomePath, '/.jira/');
  }
});
