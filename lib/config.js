/*global define*/
define(function (require) {

  return {
    cfgPath: process.env.HOME + '/.jira/',
    cfgFile: 'config.json',
    auth: {},
    transitions: {
      open: 1,
      inprogress: 11,
      reject: 31,
      todo: 141
    }
  };

});
