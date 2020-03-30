/*global requirejs,define,fs*/

define([], function () {
  return {
    auth: {
    },
    custom_jql: {
      reported: "reporter=currentUser() and status not in ('Done')"
    },
    user_alias: {
      "NICKNAME": "USERNAME_OF_USER"
    },
    "custom_alasql": {
      "project": "select fields->project->name , count(1)  AS counter from ? group by fields->project->name",
      "priority": "select fields->priority->name , count(1)  AS counter from ? group by fields->priority->name",
      "status": "select fields->project->name,fields->status->name , count(1)  AS counter from ? group by fields->project->name,fields->status->name"
    },
    "transition_chain":{
      "ALIAS": "COMMA_SEPERATED_VALUES"
    },
    "default_create": {
      "__always_ask": {
        "fields": {
          "description": {},
          "priority": {}
        }
      },
      "YOUR_ALIAS": {
        "project": "YOUR_PROJECT",
        "issueType": 3,
        "default": {
          "components": [{
            "id": "15226"
          }],
          "customfield_12901": "infrastructure",
          "customfield_12902": {
            "id": "11237"
          }
        }
      }
    },
    "edit_meta": {
	    "__default": {
		    "wish": {
		      "fields": {
			      "priority": {
			        "id": "9"
			      }
		      }
		    }
	    },
      "__schema":{
        "customfield_10007": {
          "type": "number"
        }
      },
	    "sprint": {
		    "key": "customfield_10007",
        "type": "number"
	    },
	    "label": {
		    "key": "labels",
		    "default": {
		      "test1": "t1,t2"
		    }
	    }
    },
    options: {
      jira_stop: {
        status: "To Do"
      },
      jira_start: {
        status: "In Progress"
      },
      jira_review: {
        status: "In Review"
      },
      "jira_invalid": {
        "status": "Invalid"
      },
      jira_done: {
        status: "Done",
        check_resolution: false
      },
      available_issues_statuses: [
        "Open",
        "In Progress",
        "Reopened",
        "To Do",
        "In Review"
      ],
      list_issues_columns: {
        Key: {
          jsPath: "key"
        },
        Priority: {
          jsPath: "fields.priority.name",
          defaultValue: ""
        },
        Summary: {
          jsPath: "fields.summary",
          truncate: 50
        },
        Status: {
          jsPath: "fields.status.name"
        }
      },
      work_hours_in_day: 8
    }
  }
});
