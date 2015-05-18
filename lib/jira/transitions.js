/*global requirejs,console,define,fs*/
define([
  'superagent',
  'cli-table',
  '../../lib/config'
], function (request, Table, config) {

  var transitions = {
    query: null,
    transitions: null,
    transitionID: null,

    doTransition: function (issue, transitionID, resolutionID, cb) {
      var that = this;

      this.query = 'rest/api/2/issue/' + issue + '/transitions';

      var requestBody = { transition: { id: transitionID } };
      if (resolutionID) {
        requestBody.fields = {resolution: {id: resolutionID}};
      }

      request
        .post(config.auth.url + this.query)
        .send(requestBody)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
          }

          if (cb) {
            cb();
          }
        });
    },

    getTransitionCode: function (issue, transitionName, cb) {
      var that = this,
        i = 0;

      this.query = 'rest/api/2/issue/' + issue + '/transitions';

      request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          var transitions = (res.body.transitions || []);
          transitions.some(function (transition) {
            if (transition.name === transitionName) {
              that.transitionID = transition.id;
            } else if (transition.to.name === transitionName) {
              that.transitionID = transition.id;
            }
          });

          if (!that.transitionID) {
            console.log('Issue already ' + transitionName + ' or bad transition.');

            if (transitions){
              console.log('Available Transitions');
              var table = new Table({
                head: ['Key', 'Name']
              });
              transitions.forEach(function(item){
                table.push([item.id, item.name]);
              });
              console.log(table.toString());
              console.log('You can change that behaviour by editing ~/.jira/config.json');
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
        .set('Authorization', 'Basic ' + config.auth.token)
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
    }

  };

  return transitions;

});
