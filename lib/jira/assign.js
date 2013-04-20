/*global requirejs,console,define,fs*/
define([
  'superagent',
  '../../lib/config'
], function (request, config) {

  var assign = {
    query: null,
    table: null,

    me: function (ticket) {
      this.query = 'rest/api/2/issue/' + ticket + '/assignee';

      request
        .put(config.auth.url + this.query)
        .send({ 'name': config.auth.user })
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }

          return console.log('Ticket [' + ticket + '] assigned to me.');

        });

      return;
    }
  };

  return assign;

});
