/*global requirejs,console,define,fs*/
define([
  'readline',
  'superagent',
  './config',
  './cache'
], function (readline, request, config, cache) {

  var getUserCompletions = function getUserCompletions(line, word, options, cb) {
    var userOptions = options && options.user ? options.user : {},
        enabled = userOptions.enabled !== undefined ? userOptions.enabled : false,
        forMention = userOptions ? userOptions.forMention : false,
        isUserComplete = word && forMention ? word.indexOf("[~") === 0 : true,
        queryWord = forMention && isUserComplete ? word.slice(2) : word;

    if (!enabled || !isUserComplete || !queryWord) {
      return cb([]);
    }

    // Cache users for a day
    var hits = cache.getSync('userCompletion', word, 60*60*24);
    if (hits && hits.length > 0) {
      cb(hits, word);
    } else {
      result = !queryWord ? null : request
        .get(config.auth.url + 'rest/api/2/user/search?username=' + queryWord)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log(res.body.errorMessages.join('\n'));
          }
          var hits = res.body.filter(function(user) { return user.name.indexOf(queryWord) == 0 } );
          hits = hits.map(function(user) { return user.name; });
          var exact = hits.filter(function(user) { return user == queryWord });
          hits = exact.length === 1 ? exact : hits;
          if (forMention) {
            hits = hits.map(function(user) { return "[~" + user + "]" } );
          }

          cache.set('userCompletion', word, hits);
          cb(hits, word);
        });
    }
  }

  var getCompletions = function getCompletions(line, word, options, cb) {
    getUserCompletions(line, word, options, function userCompletionHits(userHits, line) {
      cb(null, [userHits, line]);
    });
  }

  var getCompleter = function getCompleter(options) {

    var completer = function completer(line, cb) {
      var words = line ? line.split(/\s+/) : [],
          word = words.length > 0 ? words[words.length - 1] : "";

      if (!word) {
        cb([[], line]);
      }

      getCompletions(line, word, options, cb);
    }

    return completer;
  }

  return function(question, cb, options) {
    var options = options || options,
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          completer: getCompleter(options)
        })

    rl.question(question, function(answer) {
      rl.close();
      cb(answer);
    });
  }
});
