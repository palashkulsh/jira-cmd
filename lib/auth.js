/*global requirejs,define,fs*/
define([
  'commander',
  'fs',
  './config',
  './default_config'
], function (program, fs, config, defaultConfig) {
  var Auth = {
    cfgPath: config.cfgPath || null,
    fullPath: config.cfgFilePath || null,
    answers: {},

    checkConfig: function () {
      if (fs.existsSync(this.fullPath)) {
        configObject = JSON.parse(fs.readFileSync(this.fullPath, 'utf-8'));
        config.auth = configObject.auth;
        config.options = configObject.options;
        config.custom_jql = configObject.custom_jql;
        config.custom_alasql = configObject.custom_alasql;
        config.user_alias = configObject.user_alias;
        config.edit_meta = configObject.edit_meta;
        config.default_create = configObject.default_create;
        config.transition_chain = configObject.transition_chain;
        if (!config.options || !config.options["jira_stop"]) {
          console.log('Ops! Seems like your ' + this.fullPath + ' is out of date. Please reset you configuration.');
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
        this.updateConfig();
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = config && config.auth && config.auth.NODE_TLS_REJECT_UNAUTHORIZED || '0';
        return callback("config is already set");
      } else {
        if (!fs.existsSync(this.cfgPath)) {
          fs.mkdirSync(this.cfgPath);
        }

        this.ask('Jira URL: ', function (answer) {
          that.answers.url = answer;
          that.answers.openurl = answer;

          that.ask('Authentication Type (PASSWORD/TOKEN): ', function (authType) {
            authType = authType.toUpperCase();
            if (authType !== 'PASSWORD' && authType !== 'TOKEN') {
              console.log('Invalid authentication type. Please use PASSWORD or TOKEN');
              process.stdin.destroy();
              return;
            }
            
            that.answers.token_type = authType;

            that.ask('Username: ', function (answer) {
              that.answers.user = answer;

              if (authType === 'PASSWORD') {
                that.ask('Password: ', function (answer) {
                  that.answers.pass = answer;
                  process.stdin.destroy();
                  that.saveConfig();
                  if (callback) {
                    return callback(true);
                  }
                }, true);
              } else { // TOKEN type
                that.ask('Token: ', function (answer) {
                  that.answers.token = answer; // Store token directly without base64 encoding
                  process.stdin.destroy();
                  that.saveConfig();
                  if (callback) {
                    return callback(true);
                  }
                }, true);
              }
            });
          });
        });
      }
    },

    updateConfig: function () {
      Object.keys(defaultConfig).forEach(function (eachKey) {
        if (!config[eachKey]) {
          config[eachKey] = defaultConfig[eachKey];
        }
	      //merging keys in options if they are not present 
        if(eachKey=='options'){
          Object.keys(defaultConfig[eachKey]).forEach(function (eachOptions){
            if (!config[eachKey][eachOptions]) {
              config[eachKey][eachOptions] = defaultConfig[eachKey][eachOptions];
            }                  
          });
        }
      });
      fs.writeFileSync(this.fullPath, JSON.stringify(config, null, 2));
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
      var configFile = {},
          auth;

      if (this.answers.url) {
        if (!/\/$/.test(this.answers.url)) {
          this.answers.url += '/';
        }
      }

      auth = {
        url: this.answers.url,
        user: this.answers.user,
        token_type: this.answers.token_type
      };

      if (this.answers.token_type === 'PASSWORD') {
        this.answers.token = this.answers.user + ':' + this.answers.pass;
        auth.token = new Buffer(this.answers.token).toString('base64');
      } else {
        auth.token = this.answers.token; // Store token as-is for Bearer auth
      }

      delete this.answers.pass;

      configFile = defaultConfig;
      configFile.auth = {
        ...configFile.auth,
        ...auth
      };
      fs.writeFileSync(this.fullPath, JSON.stringify(configFile, null, 2));
      console.log('Information stored!');
    },

    // Add new helper method to get authorization header
    getAuthorizationHeader: function() {
      if (!config.auth || !config.auth.token) {
        return '';
      }

      const tokenType = config.auth.token_type || 'PASSWORD';
      if (tokenType === 'PASSWORD') {
        return 'Basic ' + config.auth.token;
      } else if (tokenType === 'TOKEN') {
        return 'Bearer ' + config.auth.token;
      }
      return '';
    }
  };

  return Auth;

});
