/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  'cli-table',
  'moment',
  '../../lib/config',
  '../../lib/auth'
], function (program, request, Table, moment, config, Auth) {
  var worklog = {

    add: function (issue, timeSpent, comment, startedAt) {
      var url = 'rest/api/latest/issue/' + issue + '/worklog';

      var formattedStart = moment(startedAt).format('YYYY-MM-DD[T]HH:mm:ss.SSSZZ');

      request
        .post(config.auth.url + url)
        .send({
          comment : comment,
          timeSpent : timeSpent,
          started : formattedStart,
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', Auth.getAuthorizationHeader())
        .end(function (res) {
          if (!res.ok) {
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
          }

          return console.log('Worklog to issue [' + issue + '] was added!.');
        });
    },

    show: function (issue) {
      var url = 'rest/api/latest/issue/' + issue + '/worklog';

      request
        .get(config.auth.url + url)
        .set('Content-Type', 'application/json')
        .set('Authorization', Auth.getAuthorizationHeader())
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
