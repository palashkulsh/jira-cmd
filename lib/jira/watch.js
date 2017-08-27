/*global requirejs,console,define,fs*/
define([
  'superagent',
  '../../lib/config'
], function (request, config) {

  var assign = {
    query: null,
    table: null,

    to: function (ticket, assignee) {
      this.query = 'rest/api/2/issue/' + ticket + '/watchers';

      request
        .post(config.auth.url + this.query)
        .send('"'+assignee+'"')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
          }

          return console.log('Added '+assignee+' as watcher to [' + ticket + '] ' + '.');

        });
    },
    me: function (ticket) {
      this.to(ticket, config.auth.user);
    }

  };

  return assign;

});
