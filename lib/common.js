define([
    'commander',
    'superagent',
    'async'
], function (program, request, async) {
    var commonUtils = {
	ask: function (question, callback, yesno, values, answer) {
	    var that = this,
		options = options || {},
		issueTypes = [],
		i = 0;
	    if(answer || answer===false){
		return callback(answer);
	    }
	    if (values && values.length > 0) {
		for (i; i < values.length; i++) {
		    if (that.isSubTask) {
			if (values[i].subtask !== undefined) {
			    if (values[i].subtask) {
				issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
			    }
			} else {
			    issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
			}
		    } else {
			if (!values[i].subtask) {
			    issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
			}
		    }
		}
		console.log(issueTypes.join('\n'));
	    }
	    program.prompt(question, function (answer) {
		if (answer.length > 0) {
		    callback(answer);
		} else {
		    if (yesno) {
			callback(false);
		    } else {
			that.ask(question, callback);
		    }
		}
	    }, options);
	},
    };

    return commonUtils;
})
