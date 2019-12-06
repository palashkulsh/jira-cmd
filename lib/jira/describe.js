/*global requirejs,console,define,fs*/
define([
  'superagent',
  'cli-table',
  'openurl',
  'url',
  '../../lib/config'
], function (request, Table, openurl, url, config) {

  var describe = {
    query: null,
    priority: null,
    table: null,

    getIssueField: function (field) {
      var that = this;

      request
        .get(config.auth.url + this.query + '?fields=' + field)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
          }

          if (res.body.fields) {
            if (typeof (res.body.fields[field]) === 'string') {
              console.log(res.body.fields[field]);
            } else {
              console.log(res.body.fields[field].name);
            }
          } else {
            console.log('Field does not exist.');
          }
        });
    },

    getIssue: function () {
      var that = this;

      request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          that.table = new Table();

          that.priority = res.body.fields.priority;
          that.description = res.body.fields.description;
          if (!that.priority) {
            that.priority = {
              name: ''
            };
          }
          if (!that.description) {
            that.description = 'No description';
          }
          that.table.push(
            {'Issue': res.body.key},
            {'Summary': res.body.fields.summary},
            {'Type': res.body.fields.issuetype.name},
            {'Priority': that.priority.name},
            {'Status': res.body.fields.status.name},
            {'Reporter': res.body.fields.reporter ? res.body.fields.reporter.displayName
             + ' <' + res.body.fields.reporter.emailAddress + '> ' : "Not Assigned"},
            {'Assignee':
              (res.body.fields.assignee ? res.body.fields.assignee.displayName : "Not Assigned")
              + ' <' + (res.body.fields.assignee?res.body.fields.assignee.emailAddress:"") + '> '},
            {'Labels': (res.body.fields.labels ? res.body.fields.labels.join(', '): "")},
            {'Subtasks': (res.body.fields.subtasks ? res.body.fields.subtasks.length : "")},
            {'Comments': res.body.fields.comment.total}
          );

          console.log(that.table.toString());

          console.log('\r\n' + that.description + '\r\n');
        });
    },

    open: function (issue) {
      openurl.open(url.resolve(config.auth.url, 'browse/' + issue));
    },

    show: function (issue, field) {
      this.query = 'rest/api/latest/issue/' + issue;
      if (field) {
        return this.getIssueField(field);
      } else {
        return this.getIssue();
      }
    }
  };

  return describe;

});
