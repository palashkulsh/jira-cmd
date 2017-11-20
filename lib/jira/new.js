/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  '../../lib/config',
  '../../lib/cache',
  'async'
], function (program, request, config, cache, async) {

  var create = {
    query: null,
    table: null,
    isSubTask: false,
    projects: [],
    priorities: [],
    answers: {
      fields: {}
    },

    ask: function (question, callback, yesno, values, answer) {
      var that = this,
        options = options || {},
        issueTypes = [],
        i = 0;

      if(answer || answer===false){
        return callback(answer);
      }      
      if (values && values.length > 0) {
        for (i; i < values.length; i++) {
          if (that.isSubTask) {
            if (values[i].subtask !== undefined) {
              if (values[i].subtask) {
                issueTypes.push('(' + values[i].id + ') ' + values[i].name);
              }
            } else {
              issueTypes.push('(' + values[i].id + ') ' + values[i].name);
            }
          } else {
            if (!values[i].subtask) {
              issueTypes.push('(' + values[i].id + ') ' + values[i].name);
            }
          }
        }
        console.log(issueTypes.join('\n'));
      }
      program.prompt(question, function (answer) {
        if (answer.length > 0) {
          callback(answer);
        } else {
          if (yesno) {
            callback(false);
          } else {
            that.ask(question, callback);
          }
        }
      }, options);
    },

    create: function(options, cb){
      // get project 
      // verify the project
      // call meta for this project https://jira.mypaytm.com/rest/api/2/issue/createmeta?projectKeys=MDO&expand=projects.issuetypes.fields&
      // get issueType
      // get required:true fields from meta
      // check if input config key given eg. payoutmdo
      // if given then set the default values from config.json for payoutmdo
      // prompt the input for other required:true fields
      // 
      // async.waterfall([
      //   async.constant.bind(null,options),
      //   function(options, wcb){
          
      //   }
      // ])
    }
  };

  return create;

});
