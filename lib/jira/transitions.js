/*global requirejs,console,define,fs*/
define([
  'superagent',
  '../../lib/config'
], function (request, config) {

  var transitions = {
    query: null,
    transitions: null,
    transitionID: null,

    doTransition: function (issue, transitionID, cb) {
      var that = this;

      this.query = 'rest/api/2/issue/' + issue + '/transitions';

      request
        .post(config.auth.url + this.query)
        .send({ transition: { id: transitionID } })
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

          res.body.transitions.some(function (transition) {
            if (transition.name === transitionName) {
              that.transitionID = transition.id;
            } else if (transition.to.name === transitionName) {
              that.transitionID = transition.id;
            }
          });

          if (!that.transitionID) {
            return console.log('Issue already ' + transitionName + ' or bad transition.');
          } else {
            cb(that.transitionID);
          }

        });
    },

    start: function (issue) {
      var that = this;

      this.transitionName = 'In Progress';

      this.getTransitionCode(issue, that.transitionName, function (transitionID) {
        that.doTransition(issue, transitionID, function () {
          return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
        });
      });
    },

    stop: function (issue) {
      var that = this;

      this.transitionName = 'To Do';

      this.getTransitionCode(issue, that.transitionName, function (transitionID) {
        that.doTransition(issue, transitionID, function () {
          return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
        });
      });
    },

    review: function (issue) {
      var that = this;

      this.transitionName = 'In Review';

      this.getTransitionCode(issue, that.transitionName, function (transitionID) {
        that.doTransition(issue, transitionID, function () {
          return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
        });
      });
    },

    done: function (issue) {
      var that = this;

      this.transitionName = 'Done';

      this.getTransitionCode(issue, that.transitionName, function (transitionID) {
        that.doTransition(issue, transitionID, function () {
          return console.log('Issue [' + issue + '] moved to ' + that.transitionName);
        });
      });
    }

  };

  return transitions;

});
