/**
 * MTurk wrapper for annotation tasks.
 *
 * This won't submit the data if assignmentId=ASSIGNMENT_ID_NOT_AVAILABLE
 *
 */

import $ from 'jquery';

function parseParameters(url){
  var params = {
    'assignmentId' : null,
    'hitId' : null,
    'workerId' : null,
    'turkSubmitTo' : null
  };

  var queryString = url.split('?')[1];

  if (queryString){
    var queryPieces = queryString.split('&');
    for (var i = 0; i < queryPieces.length; ++i){
      pieces = queryPieces[i].split('=');
      paramName = pieces[0];
      paramValue = pieces[1];
      if(paramName in params){
        params[paramName] = paramValue;
      }
    }
  }

  return params;
}

// Wrapper : 포장지, 기본 자료형에 대해서 객체로서 인식되도록 '포장'을 했다는 뜻입니다. 객체라는 상자에 자료형을 넣은 상태.
// Wrapper class : 기본자료형(int나 long)같은 데이터를 객체에 넣기 위해서 제공하는 함수들
// 

var MTurkFinishWrapper = function(submitFunc){

  var wrappedFunc = function(){

    let url = window.location.href;
    let mturkParams = parseParameters(url);

    var goodToSubmit = true;
    if (mturkParams['assignmentId'] == null || mturkParams['assignmentId'] == 'ASSIGNMENT_ID_NOT_AVAILABLE'){
      goodToSubmit = false;
    }
    if (mturkParams['hitId'] == null){
      goodToSubmit = false;
    }
    if (mturkParams['workerId'] == null){
      goodToSubmit = false;
    }
    if (mturkParams['turkSubmitTo'] == null){
      goodToSubmit = false;
    }

    if (goodToSubmit){

      taskResults['assignment_id'] = mturkParams['assignmentId'];
      taskResults['hit_id'] = mturkParams['hitId'];
      taskResults['worker_id'] = mturkParams['workerId'];

      // Store the results on the server
      submitFunc(arguments[0], ()=>{

        // Create a form and post it back to AWS
        let postURL = mturkParams['turkSubmitTo'] + 'mturk/externalSubmit';

        $(`<form action="${postURL}" method="post">
          <input type="hidden" name="assignmentId" id="assignmentId" value="${mturkParams['assignmentId']}">
          </form>`
        ).appendTo('body').submit();

      }, ()=>{
        // Should we post back to AWS even in a failure?
      });

    }
    else{
      console.log("Not submitting results, bad mturk parameters.");
    }
  }

  return wrappedFunc;
}

export {MTurkFinishWrapper};



// console.log()
// console : 객체
// log : 메소드
// () : 매개변수

// 객체 안에 있는 메서드를 시행시켜 매개변수를 작동시키는 작업
// console 창에 ()안에 있는 것이 출력된다.