/*global requirejs,console,define,fs*/
define([
  'superagent',
  'cli-table2',
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
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
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
            for (i = 0; i < res.body.total; i += 1) {
              var updated = new Date(res.body.comments[i].updated);
              updated = ' (' + updated + ')';

              console.log('\n' + res.body.comments[i].author.displayName.cyan + updated.grey);
              console.log(res.body.comments[i].body);
            }
          } else {
            return console.log('There are no comments on this issue.');
          }

        });
    }
  };

  return comment;

});
