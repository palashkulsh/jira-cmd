jira-cmd
========

[![NPM Version](https://badge.fury.io/js/jira-cmd.svg)](https://npmjs.org/package/jira-cmd)
[![Build Status](https://api.travis-ci.org/germanrcuriel/jira-cmd.svg?branch=master)](https://travis-ci.org/germanrcuriel/jira-cmd)
[![Package downloads](http://img.shields.io/npm/dm/jira-cmd.svg)](https://npmjs.org/package/jira-cmd)


A Jira command line interface based on [jilla](https://github.com/godmodelabs/jilla).

Its got tons of functionalities
  * showing all jira assigned to you
  * show all jira corresponding to custom JQL
  * showing all jira with shortcut to custom JQL saved in config
  * creating new jira
  * creating new jira with shortcut that picks the default values for fields configured in config
  * showing sprint details and sprint id for boards
  * adding an issue to sprint 
  * adding multiple issues to a sprint in one go
  * ability to use username alias shortcuts for commenting,assigning and adding watchers. It helps to not remember the usernames, just save their shortcuts in config.
## Installation

Install [node.js](http://nodejs.org/).

Then, in your shell type:

    $ npm install -g cmd-jira

## Usage

##### First use

    $ jira
    Jira URL: https://jira.atlassian.com/
    Username: xxxxxx
    Password: xxxxxx
    Information stored!

This save your credentials (base64 encoded) in your `$HOME/.jira` folder.

##### Help


  Usage: jira.js [options] [command]

  Commands:

    ls [options]           List my issues
    start <issue>          Start working on an issue.
    stop <issue>           Stop working on an issue.
    review <issue> [assignee] Mark issue as being reviewed [by assignee(optional)].
    done [options] <issue> Mark issue as finished.
    running                List issues in progress.
    jql [options] <query>  Run JQL query
    link <from> <to>       link issues
    search <term>          Find issues.
    assign <issue> [user]  Assign an issue to <user>. Provide only issue# to assign to me
    watch <issue> [user]   Watch an issue to <user>. Provide only issue# to watch to me
    comment <issue> [text] Comment an issue.
    show [options] <issue> Show info about an issue
    open <issue>           Open an issue in a browser
    worklog <issue>        Show worklog about an issue
    worklogadd [options] <issue> <timeSpent> [comment] Log work for an issue
    create [project[-issue]] Create an issue or a sub-task
    config [options]       Change configuration
    sprint [options]       Works with sprint boards
    With no arguments, displays all rapid boards
    With -r argument, attempt to find a single rapid board and display its active sprints
    With both -r and -s arguments attempt to get a single rapidboard/ sprint and show its issues. If a single sprint board isnt found, show all matching sprint boards

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

### Using Create
	
	Usage: create [options] [project[-issue]]
		Options:
	
		-h, --help                      output usage information
		-p, --project <project>         Rapid board on which project is to be created
		-P, --priority <priority>       priority of the issue
		-T --type <type>                Issue type
		-s --subtask <subtask>          Issue subtask
		-t --title <title>              Issue title
		-d --description <description>  Issue description
		-a --assignee <assignee>        Issue assignee

### Using Jira JQL

  *	get issues for jql eg. <kbd>jira jql "YOUR_JQL_OR_JQL_SHORTCUT"</kbd> when using a particular jql frequently , you can save that jql in **~/.jira/config.json**,an example jql is saved there with key reported
  * eg .  jira jql reported would run the jql written against reported key [saved by default ] in ~/.jira/config.json

        Usage: jql [options] [query]
        	Options:
          
            -h, --help           output usage information
            -c, --custom <name>  Filter by custom jql saved in jira config


### Using jira sprint functionality, you can

  * get issues tagged in a sprint eg. <kbd>jira sprint -r YOUR_RAPIDBOARD -s STRING_TO_SEARCH_IN_SPRINT_NAME</kbd>
  * tag an issue in a sprint eg. <kbd>jira sprint -a YOUR_ISSUE_KEY -i YOUR_SPRINT_ID</kbd>
  * tag multiple issues from JQL to a sprint . Eg. <kbd>jira sprint -j YOUR_JQL_OR_JQL_SHORTCUT -i YOUR_SPRINT_ID</kbd>
  
Usage: sprint [options]

	Options:	
    -h, --help                  output usage information
    -r, --rapidboard <name>     Rapidboard to show sprints for
    -s, --sprint <name>         Sprint to show the issues
    -a, --add <projIssue>       Add project issue to sprint
    -i, --sprintId <sprintId>   Id of the sprint
    -j, --jql <jql>             Id of the sprint


### searching issues
if you want to search a text in all the issues 
  * **using jira search** <kbd>jira jql search SEARCH_TERM</kbd>
  * **using jira jql [recommended]** <kbd>jira jql "summary ~ SEARCH_TERM OR description ~ SEARCH_TERM"</kbd>

--------------------------------------------------------------------------------------------------------------------------------------------------------------

### how to use username alias/nicknames with cmd-jira
  * [find users username](###finding-username)
  * save the username alias/nickname in user_alias block of  ~/.jira/config.json .
	* for eg. if username  is palashkulsh@gmail.com and you choose nickname as palash then your user_alias map would look like

	``` json
		{
			"user_alias" :{
				"nickname1" : "username of user 1",
				"nickname2" : "username 2"
			}
		}
	```
	* now you can use the nickname in following commands
	  * **to add watchers** <kbd>jira watch MPP-948 nickname1</kbd>
	  * **to tag some one in comment** <kbd>jira comment MPP-948 "[~nickname2] you are tagged in this comment"</kbd> 
      * **assigning an issue to someone using nickname** <kbd>jira assign MPP-948 nickname1</kbd> would assign MPP-948 to nickname1 user.


### finding username
  * to find a user's username
      * browse to their profile on jira
      * under their avatar/photo is a field called **Username**
      * this is the user's username which you should use.

### Explaining ~/.jira/config.json
  * **auth** : here the basic authentication information is stored. You would need to change it if url of your jira is changed.
	* example block
	
	``` json
		"auth": {
			"token": "AUTO_GENERATED_TOKEN_FROM_PASSWORD",
			"url": "YOUR_JIRA_URL",
			"user": "YOUR_JIRA_EMAIL"
		}
	```
	
	* mostly you wont need to touch this block, only when your username or password changes then you'll have to reconfigure it using jira config command.

  * **custom_jql**:  here you will store the jql to get the type of issues you frequently want to see and monitor in single command. eg. jira jql reported would give the issues corresponding to jql saved against reported key in custom_jql by default. 
	* example block
	
	``` json
		"custom_jql": {
			"mpp": "project=MPP and status !=done",
			"reported": "reporter=currentUser() and status not in ('Done', 'Invalid')",
		},

	```
	* now you can use this jql in multiple commands
	  * **listing jql issues** <kbd>jira jql reported</kbd>
       * **adding all issues in jql to a sprint id** <kbd>jira sprint -j reported -i SPRINT_ID</kbd>

  * **default_create** : now this is part of the jira new functionality, in which you can configure templates in config.json, so when you create a new jira, default values are picked from templates and other required fields or fields which you have declared mandatory are prompted for your input.
  * **edit_meta**
  * **options**

Each command have individual usage help (using --help or -h)

##### Advanced options
Checkout ```~/.jira/config.json``` for more options.

## MIT License

Copyright (c) 2013 <germanrcuriel@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

