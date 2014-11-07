#!/usr/bin/env node

var requirejs = require('requirejs');

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
  '../lib/jira/transitions'
], function (program, config, auth, ls, describe, assign, comment, create, transitions) {

  program
    .version('v0.1.3');

  program
    .command('ls')
    .description('List my issues')
    .option('-p, --project <name>', 'Filter by project', String)
    .option('-t, --type <name>', 'Filter by type', String)
    .option('-w, --watching',  'List all watched issues by type')
    .action(function (options) {
      auth.setConfig(function (auth) {
        if (auth) {
          if (options.watching && options.project) {
            ls.showWatchingByProject(options.project, options.type);
          } else if (options.project) {
            ls.showByProject(options.project, options.type);
          } else if (options.watching) {
            ls.showAllWatching(options.type);
          } else {
            ls.showAll(options.type);
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
    .command('coding <issue>')
    .description('Start coding an issue.')
    .action(function (issue) {
      auth.setConfig(function (auth) {
        if (auth) {
          transitions.coding(issue);
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
          if(assignee) {
            assign.to(issue, assignee);
          }
        }
      });
    });

  program
    .command('resolve <issue>')
    .description('Mark issue as resolved.')
    .action(function (issue) {
      auth.setConfig(function (auth) {
        if (auth) {
          transitions.resolve(issue);
        }
      });
    });

  program
    .command('done <issue>')
    .description('Mark issue as finished.')
    .action(function (issue) {
      auth.setConfig(function (auth) {
        if (auth) {
          transitions.done(issue);
        }
      });
    });

  program
    .command('running')
    .description('List issues in progress.')
    .action(function () {
      auth.setConfig(function (auth) {
        if (auth) {
          ls.showInProgress();
        }
      });
    });

  program
    .command('jql <query>')
    .description('Run JQL query')
    .action(function (query) {
      auth.setConfig(function (auth) {
        if (auth) {
          ls.jqlSearch(query);
        }
      });
    });

  program
    .command('search <term>')
    .description('Find issues.')
    .action(function (query) {
      auth.setConfig(function (auth) {
        if (auth) {
          ls.search(query);
        }
      });
    });


  program
    .command('assign <issue> [user]')
    .description('Assign an issue to <user>. Provide only issue# to assign to me')
    .action(function (issue, user) {
      auth.setConfig(function (auth) {
        if (auth) {
          if(user) {
            assign.to(issue, user);
          } else {
            assign.me(issue);
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
    .command('create')
    .description('Create an issue or a sub-task')
    .action(function () {
      auth.setConfig(function (auth) {
        if (auth) {
          create.newIssue();
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

  program.parse(process.argv);

  if (program.args.length === 0) {
    auth.setConfig(function (auth) {
      if (auth) {
        program.help();
      }
    });
  }

});
