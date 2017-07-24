/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  'cli-table',
  '../../lib/config'
], function (program, request, Table, config) {

  var getRapidBoardID = function getRapidBoardID(rapidBoardID, cb){
    if (typeof(rapidBoardID) !== 'string') {
      rapidBoardID = undefined;
    }

    request
      .get(config.auth.url + 'rest/greenhopper/latest/rapidviews/list')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic ' + config.auth.token)
      .end(function (res) {
        if (!res.ok) {
          console.log("Error getting rapid boards. HTTP Status Code: " + res.status);
          console.dir(res.body);
          return
        }
        displayRapidBoards(rapidBoardID, res.body, cb);
      });
  }

  var displayRapidBoards = function displayRapidBoards(rapidBoardID, data, cb) {
    var table = new Table({head: ['Key', 'Name']});
    var pushTable = [];
    for (i = 0; i < data.views.length; i++) {
      var item = data.views[i];
      if (rapidBoardID !== undefined) {
        if (item.name.toLowerCase() == rapidBoardID.toLowerCase()) {
          pushTable = [[item.id, item.name]]
          break
        }
        if (item.name.toLowerCase().indexOf(rapidBoardID.toLowerCase()) === -1) {
          continue
        }
      }
      pushTable.push([item.id, item.name]);
    }
    table.push.apply(table, pushTable);

    if (table.length === 0) {
      if (rapidBoardID === undefined) {
        console.log("No rapid boards found in your Jira instance");
      } else {
        console.log("No rapid boards found matching term in your Jira instance: " + rapidBoardID);
      }
    } else if (table.length === 1) {
      console.log("****Found Rapid Board: " + table[0][1]);
      cb(table[0][0]);
    } else {
      console.log("\nMatching Rapid Boards:");
      console.log("=========================================\n")
      console.log(table.toString());
    }
  }

  var getSprintID = function getSprintID(rapidBoardID, sprintID, cb){
    if (typeof(sprintID) !== 'string') {
      sprintID = undefined;
    }

    request
      .get(config.auth.url + 'rest/greenhopper/latest/sprintquery/' + rapidBoardID)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic ' + config.auth.token)
      .end(function (res) {
        if (!res.ok) {
          console.log("Error getting sprints. HTTP Status Code: " + res.status);
          console.dir(res.body);
          return
        }
        displaySprints(rapidBoardID, sprintID, res.body, cb);
      });
  }

  var displaySprints = function displaySprints(rapidBoardID, sprintID, data, cb) {
    var table = new Table({head: ['Key', 'Name', 'Status']});
    var pushTable = [];
    for (i = 0; i < data.sprints.length; i++) {
      var item = data.sprints[i];
      if (sprintID !== undefined) {
        if (item.name.toLowerCase() == sprintID.toLowerCase()) {
          pushTable = [[item.id, item.name, item.state]]
          break
        }
        if (item.name.toLowerCase().indexOf(sprintID.toLowerCase()) === -1) {
          continue
        }
      }
      pushTable.push([item.id, item.name, item.state]);
    }
    table.push.apply(table, pushTable);

    if (table.length == 0) {
      if (sprintID === undefined) {
        console.log("No sprints found in rapid board " + rapidBoardID);
      } else {
        console.log("No sprints found matching term in rapid board " + rapidBoardID + ": " + sprintID);
      }
    } else if (table.length === 1) {
        console.log("****Found Sprint: " + table[0][1]);
        cb(table[0][0]);
    } else {
      console.log("\nMatching Sprints:");
      console.log("=========================================\n")
      console.log(table.toString());
    }
  }

  var getSprintIssues = function getSprintIssues(rapidBoardID, sprintID, cb) {
    var qParams = 'rapidViewId=' + rapidBoardID + '&sprintId=' + sprintID
    request
      .get(config.auth.url + 'rest/greenhopper/latest/rapid/charts/sprintreport?' + qParams)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic ' + config.auth.token)
      .end(function (res) {
        if (!res.ok) {
          console.log("Error getting sprint data. HTTP Status Code: " + res.status);
          console.dir(res.body);
          return
        }
        cb(res.body);
      });
  }

  var displaySprintIssues = function displaySprintIssues(rapidBoardID, sprintID, data) {
    var sprint = new Table({
      head: ['Key', 'Name', 'Status', 'Start Date', 'End Date']
    });
    var completed = new Table({
      head: ['Key', 'Type', 'Assignee', 'Priority', 'Status', 'Summary']
    });
    var incompleted = new Table({
      head: ['Key', 'Type', 'Assignee', 'Priority', 'Status', 'Summary']
    });
    var punted = new Table({
      head: ['Key', 'Type', 'Assignee', 'Priority', 'Status', 'Summary']
    });

    var pushIssues = function pushIssues(issues, table) {
      if (!issues) return;
      issues.forEach(function(issue) {
        var priority = issue.priorityName || "Unknown",
            summary = issue.summary.length > 45 ?
              issue.summary.substr(0, 42) + '...' : issue.summary,
            status = issue.statusName || "Unknown",
            assignee = issue.assignee || "None",
            key = issue.key || "Unknown",
            type = issue.typeName || "Unknown"

        table.push([ key, type, assignee, priority, status, summary ]);
      });
    }

    pushIssues(data.contents.completedIssues, completed);
    pushIssues(data.contents.issuesNotCompletedInCurrentSprint, incompleted);
    pushIssues(data.contents.puntedIssues, punted);
    sprint.push([data.sprint.id,
                data.sprint.name,
                data.sprint.state,
                data.sprint.startDate,
                data.sprint.endDate]);

    var displayTable = function displayTable(msg, table) {
      if (table.length > 0 ) {
        console.log(msg);
        console.log(table.toString());
        console.log("\n==============================================================\n");
      }
    }

    console.log("\n==============================================================");
    console.log("====                        SPRINT                        ====");
    console.log("==============================================================\n");
    displayTable("Sprint:", sprint);
    displayTable("Completed Issues:", completed);
    displayTable("Punted Issues:", punted);
    displayTable("Incompleted Issues:", incompleted);
  }

  return function sprint(userRapidBoardID, userSprintID) {
    getRapidBoardID(userRapidBoardID, function(rapidBoardID) {
      getSprintID(rapidBoardID, userSprintID, function(sprintID) {
        getSprintIssues(rapidBoardID, sprintID, function(data) {
          displaySprintIssues(rapidBoardID, sprintID, data);
        });
      });
    });
  }
});
