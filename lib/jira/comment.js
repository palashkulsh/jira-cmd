/*global requirejs,console,define,fs*/
define([
  'superagent',
  'cli-table',
  '../../lib/config'
], function (request, Table, config) {

  var comment = {
    query: null,
    table: null,

    to: function (issue, comment) {
      this.query = 'rest/api/latest/issue/' + issue + '/comment';

      request
        .post(config.auth.url + this.query)
        .send({ body: comment })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          return console.log('Comment to issue [' + issue + '] was posted!.');

        });
    },

    show: function (issue) {
      var that = this,
        i = 0;

      this.query = 'rest/api/latest/issue/' + issue + '/comment';

      request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          if (res.body.total > 0) {
            that.table = new Table({
              head: ['Author', 'Comment']
            });

            for (i = 0; i < res.body.total; i++) {
              that.table.push(
                [
                  res.body.comments[i].author.displayName,
                  res.body.comments[i].body
                ]
              );
            }

            return console.log(that.table.toString());

          } else {
            return console.log('There are no comments on this issue.');
          }

        });
    }
  };

  return comment;

});
