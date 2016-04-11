jira-cmd
========

[![NPM Version](https://badge.fury.io/js/jira-cmd.svg)](https://npmjs.org/package/jira-cmd)
[![Build Status](https://api.travis-ci.org/germanrcuriel/jira-cmd.svg?branch=master)](https://travis-ci.org/germanrcuriel/jira-cmd)
[![Package downloads](http://img.shields.io/npm/dm/jira-cmd.svg)](https://npmjs.org/package/jira-cmd)


A Jira command line interface based on [jilla](https://github.com/godmodelabs/jilla).

## Installation

Install [node.js](http://nodejs.org/).

Then, in your shell type:

    $ npm install -g jira-cmd

## Usage

##### First use

    $ jira
    Jira URL: https://jira.atlassian.com/
    Username: xxxxxx
    Password: xxxxxx
    Information stored!

This save your credentials (base64 encoded) in your `$HOME/.jira` folder.

##### Help

Usage: jira [options] [command]

  Commands:

    ls [options]           List my issues
    start <issue>          Start working on an issue.
    stop <issue>           Stop working on an issue.
    review <issue> [assignee] Mark issue as being reviewed [by assignee(optional)].
    done [options] <issue> Mark issue as finished.
    running                List issues in progress.
    jql <query>            Run JQL query
    search <term>          Find issues.
    assign <issue> [user]  Assign an issue to <user>. Provide only issue# to assign to me
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

Each command have individual usage help (using --help or -h)

##### Advanced options
Checkout ```~/.jira/config.json``` for more options.

## MIT License

Copyright (c) 2013 <germanrcuriel@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

