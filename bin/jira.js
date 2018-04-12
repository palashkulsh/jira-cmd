#!/usr/bin/env node

var requirejs = require('requirejs');
// https://docs.atlassian.com/jira/REST/server/?_ga=2.55654315.1871534859.1501779326-1034760119.1468908320#api/2/issueLink-linkIssues
// https://developer.atlassian.com/jiradev/jira-apis/about-the-jira-rest-apis/jira-rest-api-tutorials/jira-rest-api-examples#JIRARESTAPIexamples-Creatinganissueusingcustomfields
// required fields https://jira.project.com/rest/api/2/issue/createmeta?projectKeys=MDO&expand=projects.issuetypes.fields&
requirejs.config({
    baseUrl: __dirname
});

requirejs([
    'commander',
    '../lib/config',
    '../lib/auth',
    '../lib/jira/ls',
    '../lib/jira/describe',
    '../lib/jira/assign',
    '../lib/jira/comment',
    '../lib/jira/create',
    '../lib/jira/sprint',
    '../lib/jira/transitions',
    '../lib/jira/worklog',
    '../lib/jira/link',
    '../lib/jira/watch',
    '../lib/jira/add_to_sprint',
    '../lib/jira/new',
    '../lib/jira/edit'
], function (program, config, auth, ls, describe, assign, comment, create, sprint, transitions, worklog, link, watch, add_to_sprint, new_create, edit) {

    function finalCb(err) {
      if(err){
          console.log(err.toString());
      }
      process.exit(1);
    }

    program
        .version('v0.5.4');

    program
        .command('ls')
        .description('List my issues')
        .option('-p, --project <name>', 'Filter by project', String)
        .option('-t, --type <name>', 'Filter by type', String)
        .action(function (options) {
            auth.setConfig(function (auth) {
                if (auth) {
                    if (options.project) {
                        ls.showByProject(options.project, options.type, finalCb);
                    } else {
                        ls.showAll(options.type, finalCb);
                    }
                }
            });
        });

    program
        .command('start <issue>')
        .description('Start working on an issue.')
        .action(function (issue) {
            auth.setConfig(function (auth) {
                if (auth) {
                    transitions.start(issue);
                }
            });
        });

    program
        .command('stop <issue>')
        .description('Stop working on an issue.')
        .action(function (issue) {
            auth.setConfig(function (auth) {
                if (auth) {
                    transitions.stop(issue);
                }
            });
        });

    program
        .command('review <issue> [assignee]')
        .description('Mark issue as being reviewed [by assignee(optional)].')
        .action(function (issue, assignee) {
            auth.setConfig(function (auth) {
                if (auth) {
                    transitions.review(issue);
                    if (assignee) {
                        assign.to(issue, assignee);
                    }
                }
            });
        });

    program
        .command('done <issue>')
        .option('-r, --resolution <name>', 'resolution name (e.g. \'Resolved\')', String)
        .option('-t, --timeSpent <time>', 'how much time spent (e.g. \'3h 30m\')', String)
        .description('Mark issue as finished.')
        .action(function (issue, options) {
            auth.setConfig(function (auth) {
                if (auth) {

                    if (options.timeSpent) {
                        worklog.add(issue, options.timeSpent, "auto worklog", new Date());
                    }

                    transitions.done(issue, options.resolution);
                }
            });
        });

    program
        .command('invalid <issue>')
        .description('Mark issue as finished.')
        .action(function (issue) {
            auth.setConfig(function (auth) {
                if (auth) {
                    transitions.invalid(issue);
                }
            });
        });

    program
        .command('edit <issue> [input]')
        .description('edit issue.')
        .action(function (issue, input) {
            auth.setConfig(function (auth) {
                if (auth) {
		    if(input){
			edit.editWithInputPutBody(issue, input, finalCb);
		    } else{
			edit.edit(issue, finalCb);
		    }
                }
            });
        });

    program
        .command('running')
        .description('List issues in progress.')
        .action(function () {
            auth.setConfig(function (auth) {
                if (auth) {
                    ls.showInProgress(finalCb);
                }
            });
        });

    program
        .command('jql [query]')
        .description('Run JQL query')
        .option('-c, --custom <name>', 'Filter by custom jql saved in jira config', String)
        .option('-s, --custom_sql <name>', 'Filter by custom alasql saved in jira config', String)
        .option('-j, --json <value>', 'Output in json', String, 0)
        .action(function (query, options) {
            auth.setConfig(function (auth) {
                if (auth) {
                  if(options.custom_sql){
                    ls.aggregateResults(query, options, finalCb);
                  } else {
                    ls.jqlSearch(query, options, finalCb);
                  }
                }              
            });
        });

    program
        .command('link <from> <to>')
        .description('link issues')
        .action(function (from, to, options) {
            auth.setConfig(function (auth) {
                if (auth) {
                    link(from, to, options, finalCb);
                }
            });
        });

    program
        .command('search <term>')
        .description('Find issues.')
        .action(function (query) {
            auth.setConfig(function (auth) {
                if (auth) {
                    ls.search(query, finalCb);
                }
            });
        });


    program
        .command('assign <issue> [user]')
        .description('Assign an issue to <user>. Provide only issue# to assign to me')
        .action(function (issue, user) {
            auth.setConfig(function (auth) {
                if (auth) {
                    if (user) {
                        user = config.user_alias[user];
                        assign.to(issue, user);
                    } else {
                        assign.me(issue);
                    }
                }
            });
        });

    program
        .command('watch <issue> [user]')
        .description('Watch an issue to <user>. Provide only issue# to watch to me')
        .action(function (issue, user) {
            auth.setConfig(function (auth) {
                if (auth) {
                    if (user) {
                        user = config.user_alias[user];
                        watch.to(issue, user);
                    } else {
                        watch.me(issue);
                    }
                }
            });
        });

    program
        .command('comment <issue> [text]')
        .description('Comment an issue.')
        .action(function (issue, text) {
            auth.setConfig(function (auth) {
                if (auth) {
                    if (text) {
                      //replace name in comment text if present in user_alias config
                      //if vikas is nickname stored in user_alias config for vikas.sharma
                      //then 'vikas has username [~vikas] [~ajitk] [~mohit] becomes 'vikas has username [~vikas.sharma] [~ajitk] [~mohit]
                      //names which do not match any alias are not changed
                      text = text.replace(/\[~(.*?)\]/g,function(match, tag, index){
                        if(config.user_alias[tag]){
                          return '[~'+config.user_alias[tag]+']';
                        } else {
                          return tag;
                        }
                      });
                        comment.to(issue, text);
                    } else {
                        comment.show(issue);
                    }
                }
            });
        });

    program
        .command('show <issue>')
        .description('Show info about an issue')
        .option('-o, --output <field>', 'Output field content', String)
        .action(function (issue, options) {
            auth.setConfig(function (auth) {
                if (auth) {
                    if (options.output) {
                        describe.show(issue, options.output);
                    } else {
                        describe.show(issue);
                    }
                }
            });
        });

    program
        .command('open <issue>')
        .description('Open an issue in a browser')
        .action(function (issue, options) {
            auth.setConfig(function (auth) {
                if (auth) {
                    describe.open(issue);
                }
            });
        });

    program
        .command('worklog <issue>')
        .description('Show worklog about an issue')
        .action(function (issue) {
            auth.setConfig(function (auth) {
                if (auth) {
                    worklog.show(issue);
                }
            });
        });

    program
        .command('worklogadd <issue> <timeSpent> [comment]')
        .description('Log work for an issue')
        .option("-s, --startedAt [value]", "Set date of work (default is now)")
        .action(function (issue, timeSpent, comment, p) {
            auth.setConfig(function (auth) {
                if (auth) {
                    var o = p.startedAt || new Date().toString(),
                        s = new Date(o);
                    worklog.add(issue, timeSpent, comment, s);
                }
            });
        }).on('--help', function () {
            console.log('  Worklog Add Help:');
            console.log();
            console.log('    <issue>: JIRA issue to log work for');
            console.log('    <timeSpent>: how much time spent (e.g. \'3h 30m\')');
            console.log('    <comment> (optional) comment');
            console.log();
        });

    program
        .command('create [project[-issue]]')
        .description('Create an issue or a sub-task')
        .option('-p, --project <project>', 'Rapid board on which project is to be created', String)
        .option('-P, --priority <priority>', 'priority of the issue', String)
        .option('-T --type <type>', 'Issue type', String)
        .option('-s --subtask <subtask>', 'Issue subtask', String)
        .option('-t --title <title>', 'Issue title', String)
        .option('-d --description <description>', 'Issue description', String)
        .option('-a --assignee <assignee>', 'Issue assignee', String)
        .action(function (projIssue, options) {
            auth.setConfig(function (auth) {
                if (auth) {
                    create.newIssue(projIssue, options);
                }
            });
        });

    program
        .command('new [key]')
        .description('Create an issue or a sub-task')
        .option('-p, --project <project>', 'Rapid board on which project is to be created', String)
        .option('-P, --priority <priority>', 'priority of the issue', String)
        .option('-T --type <type>', 'Issue type', String)
        .option('-s --subtask <subtask>', 'Issue subtask', String)
        .option('-t --title <title>', 'Issue title', String)
        .option('-d --description <description>', 'Issue description', String)
        .option('-a --assignee <assignee>', 'Issue assignee', String)
        .action(function (key, options) {      
            auth.setConfig(function (auth) {
                if (auth) {
                  options.key=key;
                  new_create.create(options, finalCb);
                }
            });
        });

    program
        .command('config')
        .description('Change configuration')
        .option('-c, --clear', 'Clear stored configuration')
        .action(function (options) {
            if (options.clear) {
                auth.clearConfig();
            } else {
                auth.setConfig();
            }
        }).on('--help', function () {
            console.log('  Config Help:');
            console.log();
            console.log('    Jira URL: https://foo.atlassian.net/');
            console.log('    Username: user (for user@foo.bar)');
            console.log('    Password: Your password');
            console.log();
        });

    program
        .command('sprint')
        .description('Works with sprint boards\n' +
            'With no arguments, displays all rapid boards\n' +
            'With -r argument, attempt to find a single rapid board ' +
            'and display its active sprints\nWith both -r and -s arguments ' +
            'attempt to get a single rapidboard/ sprint and show its issues. If ' +
            'a single sprint board isnt found, show all matching sprint boards')
        .option('-r, --rapidboard <name>', 'Rapidboard to show sprints for', String)
        .option('-s, --sprint <name>', 'Sprint to show the issues', String)
        .option('-a, --add <projIssue> ', 'Add project issue to sprint', String)
        .option('-i, --sprintId <sprintId> ', 'Id of the sprint which you want your issues to be added to', String)
        .option('-j, --jql <jql> ', 'jql of the issues which you want to add to the sprint', String)
        .action(function (options) {
            auth.setConfig(function (auth) {
                if (auth) {
                    if (options.add) {
                        add_to_sprint.addIssuesViaKey(options, finalCb);
                    } else if (options.jql){
                      add_to_sprint.addAllJqlToSprint(options, finalCb)
                    }else {
                        sprint(options.rapidboard, options.sprint, finalCb);
                    }
                }
            });
        });

    program.parse(process.argv);

    if (program.args.length === 0) {
        auth.setConfig(function (auth) {
            if (auth) {
                program.help();
            }
        });
    }

});
