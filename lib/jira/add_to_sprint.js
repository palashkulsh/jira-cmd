//https://jira.mypaytm.com/rest/api/2/issue/MPP-509/editmeta
//https://developer.atlassian.com/jiradev/jira-apis/jira-rest-apis/jira-rest-api-tutorials/jira-rest-api-example-edit-issues
/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  'cli-table',
  '../../lib/config',
  '../../lib/cache',
  './sprint',
  './ls'
], function (program, request, Table, config, cache, sprint, ls) {

     function ask(question, callback, yesno, values, options) {
       var that = this,
           options = options || {},
           issueTypes = [],
           i = 0;
       if (values && values.length > 0) {
         for (i; i < values.length; i++) {
           issueTypes.push('(' + values[i][0] + ') ' +values[i][1]);
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
     }

     
     return function (options, cb){
       if(options.rapidboard || options.sprint){
         sprint(options.rapidboard, options.sprint,function (sprintData){
           ask('Please enter the sprint', function (sprintId){
             console.log('here')
             addToSprint(sprintId, options.add, cb);
           }, false, sprintData);
         });
       } else if (options.jql){
         addAllJqlToSprint(options.sprintId, options.jql, cb);
       } else if(options.sprintId){
         addToSprint(options.sprintId, options.add, cb);
       }
     }

     function getJiraForJql (jql,options , cb){
      if(options.custom ){
        if(config.custom_jql && config.custom_jql[options.custom]){
          this.query = 'rest/api/2/search?jql=' + encodeURIComponent(config.custom_jql[options.custom]);        
        }  else {
          this.query = 'rest/api/2/search?jql=' + encodeURIComponent(options.custom);
        }        
      } else{
        this.query = 'rest/api/2/search?jql=' + encodeURIComponent(jql);
      }
      return getIssuesKey(jql, cb);
     }

     function addAllJqlToSprint(sprintId, jql, cb){
       ls.jqlSearch(jql)
     }
     
     function addToSprint(sprintId, projIsssue, cb){       
       var data = {
         "fields": {}
       };
       if(!config.edit_meta || !config.edit_meta.sprint){
         return cb('sprint field not found');
       }
       data.fields[config.edit_meta.sprint.name] = config.edit_meta.sprint.type=='number'?Number(sprintId):sprintId;
       request
       .put(config.auth.url + '/rest/api/2/issue/'+projIsssue)
       .send(data)
       .set('Content-Type', 'application/json')
       .set('Authorization', 'Basic ' + config.auth.token)
       .end(function (res) {
         if (!res.ok) {
           console.log("Error getting rapid boards. HTTP Status Code: " + res.status);
           console.dir(res.body);
           return cb();
         }
         console.log('Added ['+projIsssue+'] to sprint with id '+sprintId);
         return cb();
       });
     }
});