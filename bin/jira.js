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
    .version('v0.0.5');

  program
    .command('ls')
    .description('List my issues')
    .option('-p, --project <name>', 'Filter by project', String)
    .option('-t, --type <name>', 'Filter by type', String)
    .action(function (options) {
      auth.setConfig(function (auth) {
        if (auth) {
          if (options.project) {
            ls.showByProject(options.project, options.type);
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
    .command('assign <issue>')
    .description('Assign a issue to me.')
    .action(function (issue) {
      auth.setConfig(function (auth) {
        if (auth) {
          assign.me(issue);
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
