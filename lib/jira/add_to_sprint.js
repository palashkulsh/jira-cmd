/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  'cli-table',
  '../../lib/config',
  '../../lib/cache',
  './sprint'
], function (program, request, Table, config, cache, sprint) {

     function ask(question, callback, yesno, values, options) {
       var that = this,
           options = options || {},
           issueTypes = [],
           i = 0;
       debugger
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
       } else if(options.sprintId){
         addToSprint(options.sprintId, options.add, cb);
       }
     }
     
     function addToSprint(sprintId, projIsssue, cb){       
       debugger
       request
       .post(config.auth.url + '/rest/greenhopper/1.0/sprint/'+sprintId+'/issues/add')
       .send({"issues":[projIsssue]})
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