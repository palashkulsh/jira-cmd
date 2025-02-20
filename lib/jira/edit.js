/*global requirejs,console,define,fs*/
define([
  'commander',
  'superagent',
  '../../lib/config',
  '../../lib/cache',
  '../../lib/common',
  'async',
  '../../lib/auth'
], function (program, request, config, cache, common, async, Auth) {
  var editMeta = {
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
	    var match;
	    program.prompt(question, function (answer) {
		    if (answer.length > 0) {
		      values && values.forEach(function(eachValue){
			      if(eachValue.id == answer || eachValue.value == answer || eachValue.name == answer){
			        answer= eachValue.value;
			        match=true;
			      }
		      });
		      if(values ){
			      if(match){
			        return callback(answer);
			      } else  {
			        editMeta.ask(question, callback, yesno, values);
			      }
		      }else {
			      return callback(answer);
		      }
		    } else {
		      if (yesno) {
			      callback(false);
		      } else {
			      editMeta.ask(question, callback);
		      }
		    }
	    }, options);
	  },

	  getMeta: function (issue, callback) {
	    this.query = '/rest/api/2/issue/'+issue+'/editmeta';
	    request
		    .get(config.auth.url + this.query)
		    .set('Content-Type', 'application/json')
		    .set('Authorization', Auth.getAuthorizationHeader())
		    .end(function (res) {
		      if (!res.ok) {
			      console.log((res.body.errorMessages || [res.error]).join('\n'));
			      return callback((res.body.errorMessages || [res.error]).join('\n'));
		      }
		      callback(null, res.body.fields);
		    });
	  },

	  getOutputFormat: function(meta, issue, field, value, putBody, cb){
	    //handling without callback scenarios
	    if(!cb){
		    cb=function(err, result){
		      if(err){
			      throw err;
		      }else {
			      return result;
		      }
		    }
	    }
	    var editing = meta[field];
	    if(!editing || !editing.schema){
		    return cb(new Error('wrong meta'));
	    }
	    if(!putBody.fields){
		    putBody.fields = {};
	    }
	    var formattedValue;
      if (config.edit_meta 
          &&  config.edit_meta['__schema'] 
          &&  config.edit_meta['__schema'][field] 
          &&  config.edit_meta['__schema'][field].type){
        editing.schema.type = config.edit_meta['__schema'][field].type;
      }
      if (editing.schema.type=='number'){
		    formattedValue = Number(value.toString());
	    } else if(editing.schema.type=='string'){
		    formattedValue = value.toString();
	    } else if (editing.schema.type=='array'){
		    //how to give multiple inputs
		    if(editing.schema.items=='string'){
		      formattedValue = value.toString().split(',');
		    } else if (editing.schema.type=='number'){
		      formattedValue = Number(value.toString());
	      } 
	    } else if (editing.schema.type=='any'){
		    console.log('not yet supported');		
	    } else if (editing.schema.type=='priority') {
		    formattedValue = {
		      id : value
		    }
	    }
	    if(!formattedValue){
		    return cb(new Error('this type of field is not supported yet'));
	    }
	    putBody.fields[field] = formattedValue;
	    return cb(null, putBody);
	  },

	  makeEditCall: function(issue, putbody, cb){
	    this.query = '/rest/api/2/issue/'+issue;
	    request
		    .put(config.auth.url + this.query)
		    .send(putbody)
		    .set('Content-Type', 'application/json')
		    .set('Authorization', Auth.getAuthorizationHeader())	   
		    .end(function (res) {
		      if (!res.ok) {
			      console.log(res)
			      if(res.body && res.body.errorMessages){
			        console.log(res.body && res.body.errorMessages && res.body.errorMessages.join('\n'));
			        return cb(res.body.errorMessages.join('\n'));
			      }
			      return cb(new Error('some error'))
		      }
		      console.log('Issue edited successfully!');
		      return cb();
		    });
	  },

	  editWithInputPutBody: function (issue, input, cb){
	    editMeta.getMeta(issue, function(err, meta){
		    if(err){
		      return cb(err);
		    }
		    var putBody = {};
		    if(config && config.edit_meta && config.edit_meta['__default'] && config.edit_meta['__default'][input]){
		      putBody = config.edit_meta['__default'][input];
		    }else {
		      var parsedInputMap = editMeta.parseEditInput(input);
		      Object.keys(parsedInputMap).forEach(function(eachField){
			      putBody = editMeta.getOutputFormat(meta, issue, eachField, parsedInputMap[eachField], putBody)
		      });
		    }
        editMeta.mergeExistingAndLatestArrayInputFields(issue, putBody, function(err, mergedPutBody){
          if(err){
            return cb(err);
          }
          editMeta.makeEditCall(issue, mergedPutBody, cb);
        })			        
	    });
	  },
	  
	  parseEditInput: function (input){
	    var inputArr = input.toString().split(';;');
	    var singleInput, inputKey,inputValue,finalKey, finalValue
	    var inputObj={};
	    inputArr.forEach(function(eachInput){
		    singleInput = eachInput.split('::');
		    inputKey = singleInput[0];
		    inputValue = singleInput[1];
        //when input type is present in config
		    if(config && config.edit_meta && config.edit_meta[inputKey] ){
		      if(config.edit_meta[inputKey].key){
			      finalKey = config.edit_meta[inputKey].key;
		      }
          //when default value for edit present in config
		      if(config.edit_meta[inputKey].default && config.edit_meta[inputKey].default[inputValue]){
			      finalValue = config.edit_meta[inputKey].default[inputValue];
		      } else {
            //else pick the input value as default value
            finalValue = inputValue;
          }    
		    } else {
		      finalKey = inputKey;
		      finalValue = inputValue;
		    }
		    inputObj[finalKey] = finalValue;
	    });
	    return inputObj;
	  },

    getExistingFieldValuesOfIssue: function(issue, cb){
      let query = 'rest/api/latest/issue/' + issue;
      request
        .get(config.auth.url + query)
        .set('Content-Type', 'application/json')
        .set('Authorization', Auth.getAuthorizationHeader())
        .end(function (res) {
          if (!res.ok) {
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
          }
          return cb(null, res.body);
        })
    },

    mergeExistingAndLatestArrayInputFields: function(issue, putBody, cb){
      editMeta.getExistingFieldValuesOfIssue(issue, function(err, existingData){
        if(err){
          return cb(err)
        }
        if(putBody && putBody.fields){
          Object.keys(putBody.fields).forEach((key)=>{
            //checking inputs
            if(putBody.fields[key] && Array.isArray(putBody.fields[key])){
              debugger
              //checking existing fields corresponding to those inputs
              if(existingData && existingData.fields && existingData.fields[key] && Array.isArray(existingData.fields[key]) ){
                putBody.fields[key] = existingData.fields[key].concat(putBody.fields[key])
              }
            }
          })
        }
        return cb(null, putBody)
      })
    },
    
	  edit: function (issue, cb){
	    editMeta.getMeta(issue, function(err, meta){
		    if(err){
		      return cb(err);
		    }
		    var metaInput= [];
		    Object.keys(meta).forEach(function(eachMeta, index){
		      metaInput.push({id: index,value: eachMeta, name: meta[eachMeta].name});
		    });
		    editMeta.ask('enter Input ', function(answer){
		      console.log(answer);
		      var inputOptions;
		      if(meta[answer] && meta[answer].allowedValues && meta[answer].allowedValues.length ){
			      inputOptions =  meta[answer].allowedValues;
		      }
		      common.ask('Enter value ',function(answerValue){
			      var putBody={};
			      editMeta.getOutputFormat(meta, issue, answer, answerValue, putBody, function(err, putBody){
			        if(err){
				        return cb(err);
			        }
              editMeta.mergeExistingAndLatestArrayInputFields(issue, putBody, function(err, mergedPutBody){
                if(err){
                  return cb(err);
                }
                editMeta.makeEditCall(issue, mergedPutBody, cb);
              })			        
			      });
		      },null, inputOptions)
		    }, null, metaInput);
	    });
	  }
  }

  return editMeta;
})
