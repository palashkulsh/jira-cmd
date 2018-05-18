/*global requirejs,define,fs*/
/*
 * ./bin/jira.js jql -c "assignee=currentUser()" -s status
 * ./bin/jira.js jql -j 1  "reporter=currentUser() and status='done' and createdDate>'2017-01-01' and createdDate<'2018-04-01'"
 * ./bin/jira.js jql -j 1  "assignee=currentUser() and createdDate>'2017-01-01' and createdDate<'2018-04-01'"
 * */
define([
  'superagent',
  'cli-table',
  '../../lib/config'
], function (request, Table, config) {

    var ls = {
        project: null,
        query: null,
        type: null,
        issues: null,
        table: null,

        callIssueApi: function (options, cb) {
            var that = this,
                i = 0;
            var allIssues = [];
            var currentLength = 0;
            var currentOffset = 0;
            var currentLimit = 500;
            async.doWhilst(function (callback) {
                currentLength = 0;
                request
                    .get(config.auth.url + that.query + '&startAt=' + currentOffset + '&maxResults=' + currentLimit)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Basic ' + config.auth.token)
                    .end(function (res) {
                        if (!res.ok) {
                            return callback((res.body.errorMessages || [res.error]).join('\n'));
                        }
                        console.log('startAt=' + currentOffset + '&maxResults=' + currentLimit);
                        allIssues.push.apply(allIssues, res.body.issues);
                        currentLength = res.body.issues.length;
                        currentOffset += currentLength;
                        return callback();
                    });
            }, function () {
                return currentLength == currentLimit;
            }, function (err) {
                return cb(null, allIssues);
            });
        },

        getIssues: function (options, cb) {
            if (!cb) {
                cb = options;
                options = null;
            }
            var that = this,
                i = 0;
            this.callIssueApi(options, function (err, issues) {
                if (err) {
                    return cb(err);
                }
                if (options && options.json) {
                    return cb(null, issues);
                }
                that.issues = issues;
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
                    //dont print if no_print is set
                    if (!(options && options.no_print)) {
                        console.log(that.table.toString());
                    }
                } else {
                    console.log('No issues');
                }
                return cb(null, that.issues);
            });
        },

        showAll: function (type, cb) {
            this.type = (type) ? '+AND+type="' + type + '"' : '';
            this.query = 'rest/api/2/search?jql=' + 'assignee=currentUser()' + this.type + '+AND+status+in+("' + this.getAvailableStatuses() + '")' + '+order+by+priority+DESC,+key+ASC' + '&maxResults=500';
            return this.getIssues(cb);
        },

        showInProgress: function (cb) {
            this.query = 'rest/api/2/search?jql=' + 'assignee=currentUser()' + '+AND+status+in+("In+Progress")' + '+order+by+priority+DESC,+key+ASC';
            return this.getIssues(cb);
        },

        showByProject: function (project, type, cb) {
            this.type = (type) ? '+AND+type=' + type : '';

            this.query = 'rest/api/2/search?jql=' + 'assignee=currentUser()' + this.type + '+AND+project=' + project + '+AND+status+in+("' + this.getAvailableStatuses() + '")' + '+order+by+priority+DESC,+key+ASC';
            return this.getIssues(cb);
        },

        search: function (query, cb) {
            this.query = 'rest/api/2/search?jql=' + 'summary+~+"' + query + '"' + '+OR+description+~+"' + query + '"' + '+OR+comment+~+"' + query + '"' + '+order+by+priority+DESC,+key+ASC';
            return this.getIssues(cb);
        },

        jqlSearch: function (jql, options, cb) {
            var query;
            if (options && options.custom) {
                if (config.custom_jql && config.custom_jql[options.custom]) {
                    query = config.custom_jql[options.custom];
                } else {
                    query = options.custom;
                }
            } else {
                if (config.custom_jql && config.custom_jql[jql]) {
                    query = config.custom_jql[jql];
                } else {
                    query = jql;
                }
            }
            this.query = 'rest/api/2/search?jql=' + encodeURIComponent(query);
            return this.getIssues(options, cb);
        },
        getAvailableStatuses: function () {
            return config.options.available_issues_statuses.join('", "');
        },

        aggregateResults: function (jql, options, cb) {
            options.json = true;
            this.jqlSearch(jql, options, function (err, issues) {
                if (err) {
                    return cb(err);
                }
                var query;
                if (options && options.custom_sql) {
                    if (config.custom_alasql && config.custom_alasql[options.custom_sql]) {
                        query = config.custom_alasql[options.custom_sql];
                    } else {
                        query = options.custom_sql;
                    }
                } else {
                    return cb(new Error('no custom sql found'));
                }
                var result = [];
                try {
                    console.log(query)
                    result = alasql(query, [issues]);
                } catch (ex) {
                    return cb(ex);
                }
                if (!result.length) {
                    return cb(new Error('No Result'));
                }
                var resultTable = new Table({
                    head: Object.keys(result[0])
                });
                var eachRow = [];
                for (i = 0; i < result.length; i += 1) {
                    eachRow = [];
                    Object.keys(result[0]).forEach(function (eachKey) {
                        eachRow.push(result[i][eachKey] || '');
                    });
                    resultTable.push(eachRow);
                }
                console.log(resultTable.toString());
                return cb(null, result);
            });
        }
    };

    return ls;

});
