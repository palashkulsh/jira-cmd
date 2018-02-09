/*global requirejs,define,fs*/
define([
  'superagent',
  'cli-table2',
  '../../lib/config'
], function (request, Table, config) {

  var ls = {
    project: null,
    query: null,
    type: null,
    issues: null,
    table: null,

    getIssues: function (cb) {
      var that = this,
        i = 0;
      request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return cb((res.body.errorMessages || [res.error]).join('\n'));
          }

          that.issues = res.body.issues;
          that.table = new Table({
            head: ['Key', 'Priority', 'Summary', 'Status']
          });

          for (i = 0; i < that.issues.length; i += 1) {
            var priority = that.issues[i].fields.priority,
              summary = that.issues[i].fields.summary,
              status = that.issues[i].fields.status;

            if (!priority) {
              priority = {
                name: ''
              };
            }
            if (summary.length > 50) {
              summary = summary.substr(0, 47) + '...';
            }
            that.table.push([
              that.issues[i].key,
              priority.name,
              summary,
              status.name
            ]);
          }

          if (that.issues.length > 0) {
            console.log(that.table.toString());
          } else {
            console.log('No issues');
          }
        return cb();
        });
    },

    showAll: function (type, cb) {
      this.type = (type) ? '+AND+type="' + type + '"' : '';
      this.query = 'rest/api/2/search?jql='
        + 'assignee=currentUser()'
        + this.type
        + '+AND+status+in+("' + this.getAvailableStatuses() + '")'
        + '+order+by+priority+DESC,+key+ASC';
      return this.getIssues(cb);
    },

    showInProgress: function (cb) {
      this.query = 'rest/api/2/search?jql='
        + 'assignee=currentUser()'
        + '+AND+status+in+("In+Progress")'
        + '+order+by+priority+DESC,+key+ASC';
      return this.getIssues(cb);
    },

    showByProject: function (project, type, cb) {
      this.type = (type) ? '+AND+type=' + type : '';

      this.query = 'rest/api/2/search?jql='
        + 'assignee=currentUser()'
        + this.type
        + '+AND+project=' + project
        + '+AND+status+in+("' + this.getAvailableStatuses() + '")'
        + '+order+by+priority+DESC,+key+ASC';
      return this.getIssues(cb);
    },

    search: function (quer, cb) {
      this.query = 'rest/api/2/search?jql='
        + 'summary+~+"' + query + '"'
        + '+OR+description+~+"' + query + '"'
        + '+OR+comment+~+"' + query + '"'
        + '+order+by+priority+DESC,+key+ASC';
      return this.getIssues(cb);
    },

    jqlSearch: function (jql, options, cb) {
      debugger
      if(options.custom ){
        if(config.custom_jql && config.custom_jql[options.custom]){
          this.query = 'rest/api/2/search?jql=' + encodeURIComponent(config.custom_jql[options.custom]);        
        }  else {
          this.query = 'rest/api/2/search?jql=' + encodeURIComponent(options.custom);
        }        
      } else{
        this.query = 'rest/api/2/search?jql=' + encodeURIComponent(jql);
      }
      return this.getIssues(cb);
    },
    getAvailableStatuses: function () {
      return config.options.available_issues_statuses.join('", "');
    }
  };

  return ls;

});
