/*global requirejs,define,fs*/
define([
  'commander',
  'fs',
  '../lib/config'
], function (program, fs, config) {

  var Auth = {
    cfgPath: config.cfgPath || null,
    cfgFile: config.cfgFile || null,
    fullPath: config.cfgPath + config.cfgFile || null,
    answers: {},

    checkConfig: function () {
      if (fs.existsSync(this.fullPath)) {
        configObject = JSON.parse(fs.readFileSync(this.fullPath, 'utf-8'));

        config.auth = configObject.auth;
        config.options = configObject.options;

        if (!config.options) {
          console.log('Ops! Seems like your ~/.jira/config.json is out of date. Please reset you configuration.');
          return false;
        } else {
          return true;
        }

      } else {
        return false;
      }
    },

    ask: function (question, callback, password) {
      var that = this;

      if (password) {
        program.password(question, function (answer) {
          if (answer.length > 0) {
            callback(answer);
          } else {
            that.ask(question, callback, true);
          }
        });
      } else {
        program.prompt(question, function (answer) {
          if (answer.length > 0) {
            callback(answer);
          } else {
            that.ask(question, callback);
          }
        });
      }
    },

    setConfig: function (callback) {
      var that = this;

      if (this.checkConfig()) {
        return callback(true);
      } else {
        if (!fs.existsSync(this.cfgPath)) {
          fs.mkdirSync(this.cfgPath);
        }

        this.ask('Jira URL: ', function (answer) {
          that.answers.url = answer;

          that.ask('Username: ', function (answer) {
            that.answers.user = answer;

            that.ask('Password: ', function (answer) {
              that.answers.pass = answer;
              process.stdin.destroy();
              that.saveConfig();
              if (callback) {
                return callback(true);
              }
            }, true);
          });
        });
      }
    },

    clearConfig: function () {
      var that = this;

      if (!fs.existsSync(this.fullPath)) {
        if (fs.existsSync(this.cfgPath)) {
          fs.rmdirSync(this.cfgPath);
        }
        console.log('There is no stored data. Skipping.');
      } else {
        program.confirm('Are you sure? ', function (answer) {
          if (answer) {
            fs.unlinkSync(that.fullPath);
            fs.rmdirSync(that.cfgPath);
            console.log('Configuration deleted successfully!');
          }
          process.stdin.destroy();
        });
      }
    },

    saveConfig: function () {
      var configFile = {}, auth;

      if (this.answers.url) {
        if (!/\/$/.test(this.answers.url)) {
          this.answers.url += '/';
        }
      }

      if (this.answers.user && this.answers.pass) {
        this.answers.token = this.answers.user + ':' + this.answers.pass;

        auth = {
          url: this.answers.url,
          user: this.answers.user,
          token: new Buffer(this.answers.token).toString('base64')
        };

        delete this.answers.pass;
      }

      configFile = {
        auth: auth,
        options: {
          available_issues_statuses: [
            "Open",
            "In Progress",
            "Reopened",
            "To Do",
            "In Review"
          ]
        }
      };

      fs.writeFileSync(this.fullPath, JSON.stringify(configFile, null, 2));
      console.log('Information stored!');
    }
  };

  return Auth;

});
