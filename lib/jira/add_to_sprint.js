/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  'cli-table',
  '../../lib/config',
  '../../lib/cache',
  './sprint',
  './ls',
  'async'
], function (program, request, Table, config, cache, sprint, ls, async) {

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

     var add_to_sprint = {     
       addIssuesViaKey: function addIssuesViaKey(options, cb){
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
       },

       addAllJqlToSprint:     function addAllJqlToSprint(options, cb){
         if(!options.jql || !options.sprintId){
           return cb(new Error('jql or sprint id not found'));
         }
         ls.jqlSearch(options.jql, {}, function(err, issues){
           ask('Are you sure you want to add all above issues in sprint id '+options.sprintId+' [y/N]: ', function(answer){
             if(answer!=='y'){
               return cb('no issues were added to sprint');
             }
             async.eachSeries(issues, function(eachIssue, scb){               
               addToSprint(options.sprintId, eachIssue.key, scb);
             }, function(){
                  return cb();                  
                });
           }, true);
         });
       }

     };

     function addAllJqlToSprint(sprintId, jql, cb){
       ls.jqlSearch(jql, {}, function(err, issues){
         ask('Are you sure you want to add all above issues in sprint id '+sprintId+':', function(answer){
           console.log(answer);
         }, true);
       });
     }
     
     function addToSprint(sprintId, projIsssue, cb){       
       var data = {
         "fields": {}
       };
       if(!config.edit_meta || !config.edit_meta.sprint){
         return cb('sprint field not found');
       }
       data.fields[config.edit_meta.sprint.key] = config.edit_meta.sprint.type=='number'?Number(sprintId):sprintId;
       console.log('****************');
       console.log(JSON.stringify(data,null,2));
       console.log('****************');
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

     //exporting from file
     return add_to_sprint;
});
