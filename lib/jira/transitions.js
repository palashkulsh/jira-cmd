/*global requirejs,console,define,fs*/
define([
  'superagent',
  'cli-table',
  '../../lib/config',
  'commander',
  'async',
  '../../lib/auth'
], function (request, Table, config, program, async, Auth) {

  var transitions = {
    query: null,
    transitions: null,
    transitionID: null,

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
	    valueArray = values.map(function(value){
	      return value.id;
	    });
      program.prompt(question, function (answer) {
        if (answer.length > 0 ) {
	        if(valueArray.indexOf(answer)>=0){
		        callback(answer);
	        } else {
		        that.ask(question, callback, yesno, values);
	        }
        } else {
          if (yesno) {
            callback(false);
          } else {
            that.ask(question, callback);
          }
        }
      }, options);
    },
    
    
    doTransition: function (issue, transitionID, resolutionID, cb) {
      var that = this;

      if (typeof resolutionID === 'function') {
        cb = resolutionID;
        resolutionID = null;
      }

      this.query = 'rest/api/2/issue/' + issue + '/transitions';

      var requestBody = { transition: { id: transitionID } };
      if (resolutionID  && config.options["jira_done"]["check_resolution"]) {
        requestBody.fields = {resolution: {id: resolutionID}};
      }
      console.log(`marking issue ${issue} to ${transitionID}`);
      request
        .post(config.auth.url + this.query)
        .send(requestBody)
        .set('Content-Type', 'application/json')
        .set('Authorization', Auth.getAuthorizationHeader())
        .end(function (res) {
          if (!res.ok) {
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
          }

          if (cb) {
            cb();
          }
        });
    },

    getTransitions: function(issue, cb){
	    this.query = 'rest/api/2/issue/' + issue + '/transitions';
	    request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', Auth.getAuthorizationHeader())
        .end(function (res) {
		      if (!res.ok) {
		        debugger
		        return cb(new Error(res.body.errorMessages.join('\n')));
		      }
		      var transitions = (res.body.transitions || []);
		      return cb(null, transitions);
	      });
    },
    doTransitionChain: function (issue, transitionsArr, cb){      
      async.eachSeries(transitionsArr, function(eachTransition, scb){
        transitions.doTransition(issue,eachTransition, scb);
      }, cb)
    },
    
    makeTransition: function (issue, value, cb) {
	    transitions.getTransitions(issue, function(err, transitionsAvailable){
	      if(err){
		      return cb(err);
	      }
	      transitions.ask('Enter transition ',function(answer){
          //find the actual transition that must be done
          //split string to array and find first matching element in chain from transition available
          //discard the transition available before that and pass the rest array to do actual transitions
          debugger
          //treating userinput as alias to be used if found in config.json
          if(config && config.transition_chain && config.transition_chain[answer]){
            answer = config.transition_chain[answer];
          }
          var transitionsArr = answer.split(',');
          transitionsArr = transitionsArr.map(function(eachElem){
            return Number(eachElem);
          });
          var startTransitionsFromIndex = 0;
          var availableTransitionIds = transitionsAvailable.map(function(eachTransition){
            return Number(eachTransition.id);
          });
          transitionsArr.forEach(function(eachStatus, index){
            
            //transition is available for issue
            if(availableTransitionIds.indexOf(eachStatus)>-1){
              //this is done with assumption that we will not get stuck in cycle
              //may have to revisit later
              startTransitionsFromIndex = index;
            }
          });
          transitionsArr= transitionsArr.slice(startTransitionsFromIndex);
          debugger
		      transitions.doTransitionChain(issue, transitionsArr, function(err){
		        if(err){
			        return cb(err);
		        }
		        console.log('marked issue with transition '+answer );
		        return cb();
		      });
	      },null, transitionsAvailable, value)
	    });
    },
    
    getTransitionCode: function (issue, transitionName, cb) {
      var that = this,
          i = 0;

	    transitions.getTransitions(issue, function (err, allTransitions) {
        if (err) {
          return cb(err);
        }

        allTransitions.some(function (transition) {
          if (transition.name === transitionName) {
            that.transitionID = transition.id;
          } else if (transition.to.name === transitionName) {
            that.transitionID = transition.id;
          }
        });

        if (!that.transitionID) {
          console.log('Issue already ' + transitionName + ' or bad transition.');

          if (allTransitions){
            console.log('Available Transitions');
            var table = new Table({
              head: ['Key', 'Name']
            });
            allTransitions.forEach(function(item){
              table.push([item.id, item.name]);
            });
            console.log(table.toString());
          }

          return;
        } else {
          cb(that.transitionID);
        }

      });
    },

    getResolutionCode: function (resolutionName, callback) {
      var that = this,
          i = 0;

      this.query = 'rest/api/2/resolution';
      request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', Auth.getAuthorizationHeader())
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          var resolutions = res.body, resolutionData;

          // when a specific resolution is informed by command line.
          if (resolutionName && resolutionName !== "") {
            resolutions.forEach(function(resolution){
              if (resolution.name == resolutionName) {
                resolutionData = resolution;
              }
            });
          }
          // default is always first
          else if (!resolutionName && resolutions.length > 0) {
            resolutionData = resolutions[0];
          }

          if (resolutionData) {
            return callback(resolutionData.id);
          } else {
            console.log('Resolution Not Found!\n');
            console.log('Available Resolutions');
            var table = new Table({
              head: ['Key', 'Name', 'Description']
            });
            resolutions.forEach(function(item){
              table.push([item.id, item.name, item.description]);
            });
            console.log(table.toString());
            console.log('You can change that behaviour by editing ~/.jira/config.json');
            return;
          }

        });
    },

    start: function (issue) {
      var that = this;

      this.transitionName = config.options["jira_start"]["status"];

      this.getTransitionCode(issue, that.transitionName, function (transitionID) {
        that.doTransition(issue, transitionID, function () {
          return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
        });
      });
    },

    stop: function (issue) {
      var that = this;
      this.transitionName = config.options["jira_stop"]["status"];

      this.getTransitionCode(issue, that.transitionName, function (transitionID) {
        that.doTransition(issue, transitionID, function () {
          return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
        });
      });
    },

    review: function (issue) {
      var that = this;

      this.transitionName = config.options["jira_review"]["status"];

      this.getTransitionCode(issue, that.transitionName, function (transitionID) {
        that.doTransition(issue, transitionID, function () {
          return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
        });
      });
    },

    done: function (issue, resolution) {
      var that = this;

      this.transitionName = config.options["jira_done"]["status"];
      this.resolutionName = resolution;

      this.getResolutionCode(this.resolutionName, function (resolutionID) {
        that.getTransitionCode(issue, that.transitionName, function (transitionID) {
          that.doTransition(issue, transitionID, resolutionID, function () {
            return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
          });
        });
      });
    },

    invalid: function (issue, resolution) {
      var that = this;

      this.transitionName = config.options["jira_invalid"]["status"];
      this.resolutionName = resolution;

      this.getResolutionCode(this.resolutionName, function (resolutionID) {
        that.getTransitionCode(issue, that.transitionName, function (transitionID) {
          that.doTransition(issue, transitionID, resolutionID, function () {
            return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
          });
        });
      });
    }


  };

  return transitions;

});
