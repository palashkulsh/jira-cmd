/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  'cli-table',
  '../../lib/config'
], function (program, request, Table, config) {
  var worklog = {

    add: function (issue, timeSpent, comment) {
      var url = 'rest/api/latest/issue/' + issue + '/worklog';

      request
        .post(config.auth.url + url)
        .send({
          comment : comment ,
          timeSpent : timeSpent
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          return console.log('Worklog to issue [' + issue + '] was added!.');
        });
    },

    show: function (issue) {
      var url = 'rest/api/latest/issue/' + issue + '/worklog';

      request
        .get(config.auth.url + url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          if (res.body.total == 0) {
            console.log('No work yet logged');
            return;
          }

          var tbl = new Table({
            head: ['Date', 'Author', 'Time Spent', 'Comment']
          }),
            worklogs = res.body.worklogs;

          for(i = 0; i < worklogs.length; i++) {
            var startDate = worklogs[i].created,
                author = worklogs[i].author.displayName,
                timeSpent = worklogs[i].timeSpent,
                comment = worklogs[i].comment || '';

            if (comment.length > 50) {
              comment = comment.substr(0, 47) + '...';
            }

            tbl.push([
              startDate,  //TODO format date
              author,
              timeSpent,
              comment
            ]);

          }

          console.log(tbl.toString());
        });
    }
  };

  return worklog;
});
