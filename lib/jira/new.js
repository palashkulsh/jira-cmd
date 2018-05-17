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
    projectMeta:{},
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
                issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
              }
            } else {
              issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
            }
          } else {
            if (!values[i].subtask) {
              issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
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

    askProject: function (project, callback) {
      var that = this,
        i = 0;
      this.ask('Type the project name or key: ', function (answer) {
        var projectId = 0,
          index = 0;
        answer = answer.charAt(0).toUpperCase() + answer.substring(1).toLowerCase();
        for (i; i < that.projects.length; i++) {
          if (answer == that.projects[i].key ||answer.toUpperCase() == that.projects[i].key) {
            projectId = that.projects[i].id;
            index = i;
          } else if (answer == that.projects[i].name) {
            projectId = that.projects[i].id;
            index = i;
          }
        }
        if (projectId > 0) {
          callback(projectId, index, answer.toUpperCase());
        } else {
          console.log('Project "' + answer + '" does not exists.');
          that.askProject(project, callback);
        }
      }, false, null, project);
    },

    getMeta: function (key, callback) {
      this.query = 'rest/api/2/issue/createmeta';
      if(key){
        this.query += '?projectKeys='+key+'&expand=projects.issuetypes.fields';
      }
      var cachedRes = cache.getSync('meta', key?'project'+key:'project', 1000*60*60*24*7);
      if(cachedRes){
        return callback(null, cachedRes);
      }
      request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            console.log((res.body.errorMessages || [res.error]).join('\n'));
            return callback((res.body.errorMessages || [res.error]).join('\n'));
          }
          cache.set('meta', key?'project'+key:'project', res.body.projects);       
          callback(null, res.body.projects);
        });
    },

    askIssueType: function (type, callback) {
      var that = this,
        issueTypeArray = create.projectMeta.issuetypes;
      that.ask('Select issue type: ', function (issueType) {
        callback(issueType);
      }, false, issueTypeArray, type);
    },

    askRequired: function(eachField, eachFieldKey, defaultAnswer, scb){
      var that =  this;
      if(!eachField.required && !(config.default_create && config.default_create['__always_ask'] && config.default_create['__always_ask'].fields && config.default_create['__always_ask'].fields[eachFieldKey])){
        return scb();
      }
      var question = (eachField.allowedValues? 'Select ' : 'Enter ') +eachField.name+' : ';
      that.ask(question,function(answer){
        if(answer){
          //supplying answer by field type
           if(eachField.schema.type == 'array'){
             if(eachField.schema.items !=='string'){
               create.answers.fields[eachFieldKey] = [{
                 id: answer
               }];
             } else {
               answer =  answer.split(',');             
               create.answers.fields[eachFieldKey] = answer;
             }
           } else if (eachField.schema.type == 'string') {
             create.answers.fields[eachFieldKey] = answer;
           } else {
             create.answers.fields[eachFieldKey] = {
               id : answer
             }
           }
          return scb();
        } else {
          return create.askRequired(eachField, eachFieldKey, defaultAnswer, scb);
        }
      }, false, eachField.allowedValues, defaultAnswer);
    },

    saveIssue: function (cb) {
      this.query = 'rest/api/2/issue';
      request
        .post(config.auth.url + this.query)
        .send(create.answers)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
            if (!res.ok) {
		            console.log(res)
		            if(res.body && res.body.errorMessages){
		              console.log(res.body && res.body.errorMessages && res.body.errorMessages.join('\n'));
		              return cb(res.body.errorMessages.join('\n'));
		            }
		            return cb(new Error('some error'))
            }
        console.log('Issue ' + res.body.key + ' created successfully!');
          return cb();
        });
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
      var that =  this;
      async.waterfall([
        function(wcb){
          create.getMeta(null, function (err ,meta) {            
            if(err){
              return wcb(err);
            }
            create.projects=meta;
            return wcb(null, options);
          });                  
        },        
        function(options,wcb){          
          if(options.key && config.default_create && config.default_create[options.key] && config.default_create[options.key].project){
              if(!options.project && config.default_create[options.key].project){
                options.project = config.default_create[options.key].project;
              }
          }
          create.askProject(options.project, function(projectId, index, projectKey){
            options.projectId=projectId;
            options.projectIndex = index;
            options.project = projectKey;            
            create.answers.fields.project = {
              id: projectId
            };
            return  wcb(null, options);
          });
        },
        function (options, wcb){
          create.getMeta(options.project, function (err ,meta) {            
            if(err){
              return wcb(err);
            }
            meta.forEach(function(eachProjectMeta){
              if(eachProjectMeta.id==options.projectId){
                create.projectMeta = eachProjectMeta;
              }
            });
            if(!create.projectMeta){
              return wcb('project meta not found');
            }
            return wcb(null, options);
          });                            
        },
        function(options, wcb){
          //using default from config
          if(options.key && config.default_create && config.default_create[options.key] && config.default_create[options.key].issueType){
              if(!options.type && config.default_create[options.key].issueType){
                options.type = config.default_create[options.key].issueType;
              }
          }
          create.askIssueType(options.type, function(issueType){
            create.answers.fields.issuetype = {
              id: issueType
            };
            options.type= issueType;
            create.projectMeta.issuetypes.forEach(function(eachIssueType){
              if(eachIssueType.id==issueType){
                create.issueType=eachIssueType;
              }
            });
            if(!create.issueType){
              return wcb(new Error('invalid issue type'));
            }
            return wcb(null, options);
          });
        },
        function(options, wcb){
          //ask for required fields
          async.eachSeries(Object.keys(create.issueType.fields), function (eachFieldKey, scb){
            var eachField = create.issueType.fields[eachFieldKey];
            //if only 1 allowed value then take it as answer  and dont prompt the user
            var defaultAnswer;
            if(eachField.allowedValues && eachField.allowedValues.length==1){
              defaultAnswer = eachField.allowedValues[0].id;
              return scb();
            }
            //picking field config from config
            if(options.key && config.default_create && config.default_create[options.key] && config.default_create[options.key].default){
              if(config.default_create[options.key].default[eachFieldKey]){
                create.answers.fields[eachFieldKey] = config.default_create[options.key].default[eachFieldKey];
                return scb();
              }
            }
            return create.askRequired(eachField, eachFieldKey, defaultAnswer, scb);
          }, function(){
               return wcb(null, options);
             });
        },
        function (options, wcb){
          create.saveIssue(wcb);
        }
      ],function(err){
          return cb(err);
        });
    }
  };

  return create;

});
