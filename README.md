# jira-cmd

A Jira command line interface based on [jilla](https://github.com/godmodelabs/jilla).

[![NPM](https://nodei.co/npm/jira-cmd.png?downloads=true&stars=true)](https://nodei.co/npm/jira-cmd/)

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
    done <issue>           Mark issue as finnished.
    running                List issues in progress.
    jql <query>            Run JQL query
    search <term>          Find issues.
    assign <issue> [user]  Assign an issue to <user>. Provide only issue# to assign to me
    comment <issue> [text] Comment an issue.
    show [options] <issue> Show info about an issue
    create                 Create an issue or a sub-task
    config [options]       Change configuration

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

Each command have individual usage help (using --help or -h)

## MIT License

Copyright (c) 2013 <germanrcuriel@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

