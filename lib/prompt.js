/*global requirejs,console,define,fs*/
define([
  'readline',
  'superagent',
  './config'
], function (readline, request, config) {

  var getUserCompletions = function getUserCompletions(line, word, options, cb) {
    var userOptions = options ? options.user : {},
        forMention = userOptions ? userOptions.forMention : false,
        isUserComplete = word && forMention ? word.indexOf("[~") === 0 : true,
        queryWord = forMention && isUserComplete ? word.slice(2) : word,
        queryWord = queryWord.toLowerCase();

    if (!isUserComplete || !queryWord) {
      return cb([]);
    }

    result = !queryWord ? null : request
      .get(config.auth.url + 'rest/api/2/user/search?username=' + queryWord)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic ' + config.auth.token)
      .end(function (res) {
        if (!res.ok) {
          return console.log(res.body.errorMessages.join('\n'));
        }
        var hits = res.body.map(function(user) { return user.name; });
        var exact = hits.filter(function(user) { return user.toLowerCase() == queryWord });
        hits = exact.length === 1 ? exact : hits;
        if (forMention) {
          hits = hits.map(function(user) { return "[~" + user + "]" } );
        }

        cb(hits, word);
      });
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
