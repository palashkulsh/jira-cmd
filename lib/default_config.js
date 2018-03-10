/*global requirejs,define,fs*/

define([], function () {
    return {
        auth: {},
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
            "sprint": {
                "name": "customfield_10007",
                "type": "number"
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
            ]
        }
    }
});