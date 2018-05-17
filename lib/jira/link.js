/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  '../../lib/config',
  '../../lib/cache'
], function (program, request, config, cache) {
     function ask(question, callback, yesno, values, options) {
       var that = this,
           options = options || {},
           issueTypes = [],
           i = 0;
	 //from command if provided
	 if(options.link_value){
	     return callback(options.link_value);
	 }
       if (values && values.length > 0) {
         for (i; i < values.length; i++) {
           if (that.isSubTask) {
             if (values[i].subtask !== undefined) {
               if (values[i].subtask) {
                 issueTypes.push('(' + values[i].id + ') ' + options.from + ' ' + values[i].outward + ' '+ options.to);
               }
             } else {
               issueTypes.push('(' + values[i].id + ') ' + options.from + ' ' + values[i].outward + ' '+ options.to);
             }
           } else {
             if (!values[i].subtask) {
               issueTypes.push('(' + values[i].id + ') ' +options.from + ' ' + values[i].outward + ' '+ options.to);
             }
           }
         }
         console.log(issueTypes.join('\n'));
       }

       program.prompt(question, function (answer) {
         if (answer.length > 0) {
           callback(answer);
         } else {
           if (yesno) {
             callback(false);
           } else {
             that.ask(question, callback);
           }
         }
       }, options);
     }

     function askLinkType(options, cb){
       getLinkType(function(linkTypes){
         ask('Select the linktype: ', function (link) {
           cb(link);
         }, false, linkTypes, options);
       });
     }
     
     function getLinkType(cb){
       this.query = '/rest/api/2/issueLinkType';
       var cachedRes = cache.getSync('meta', 'linktype', 1000*60*60*24*7*30);
       if(cachedRes){
         return cb(cachedRes);
       }
       request
       .get(config.auth.url + this.query)
       .set('Content-Type', 'application/json')
       .set('Authorization', 'Basic ' + config.auth.token)
       .end(function (res) {
         if (!res.ok) {
           return console.log(res.body.errorMessages.join('\n'));
         }
         cache.set('meta', 'linktype', res.body.issueLinkTypes);
         return console.log(res.body.issueLinkTypes);
       });
     }

     function callLink(reqOpts, cb){
       this.query = '/rest/api/2/issueLink';
       request
       .post(config.auth.url + this.query)
       .send(reqOpts)
       .set('Content-Type', 'application/json')
       .set('Authorization', 'Basic ' + config.auth.token)
       .end(function (res) {
         if (!res.ok) {
           return console.log(res.body.errorMessages.join('\n'));
         }
         console.log('Issues linked');
         return cb();
       });
     }

    return function link(from, to, link_value, options, cb){
       var reqOpts = {
         "type": {
           "name": "Relate"
         },
         "inwardIssue": {
           "key": from
         },
         "outwardIssue": {
           "key": to
         },
         "comment": {
           "body": "Linked related issue!"
         }
       }
       options.from = from;
	options.to = to;
	options.link_value = link_value;
       askLinkType(options, function(linkname){
         reqOpts.type.id = linkname;
         callLink(reqOpts, cb);
       });
     } 
});
