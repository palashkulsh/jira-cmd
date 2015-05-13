/*global define*/
define(function (require) {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

  return {
    cfgPath: process.env.HOME + '/.jira/',
    cfgFile: 'config.json',
    auth: {},
    options: {}
  };

});
