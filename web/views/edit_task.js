/* 참고 url : https://kyounghwan01.github.io/blog/JS/JSbasic/getElementById/#%E1%84%89%E1%85%A1%E1%84%8B%E1%85%AD%E1%86%BC%E1%84%87%E1%85%A5%E1%86%B8 */
import React from 'react';
import ReactDOM from 'react-dom';
// 리액트는 UI(User Interface) 라이브러리 
// ReactDom 은 리액트를 웹사이트에 출력(render)하는 걸 도와주는 모델
// DOM (Docment Object Model) 
import { ImageLoader } from './image_loader.js';
import { EditSequence } from './edit_seq.js';
import { FullEditView } from './full_edit.js';


// Main driver. Handles showing the instructions, and then kicking off the task sequence,
// and then sending the results back to the server.
/* 메인 드라이버. 지침을 표시한 다음 순서대로 작업을 시작하는 핸들, 결과를 서버로 다시 보냄.
var : 변수가 중복이 된다
let : 변수 재선언이 되지 않는다. / 변수 */
export let editTask = function (taskId, imageIds, categories) {

  let onFinish = function () { };

  // Start the TaskSequence 작업 시작 순서
  ReactDOM.render(
    <EditSequence taskId={taskId}
      imageIds={imageIds}
      taskView={FullEditView}
      categories={categories}
      onFinish={onFinish} />,
    document.getElementById('app')
  );



}



// 1. 변수 선언 방식
// var, let, const
// var
// 우선, var는 변수 선언 방식에 있어서 큰 단점을 가지고 있다.
// 변수를 한 번 더 선언했음에도 불구하고, 에러가 나오지 않고 각기 다른 값이 출력되는 것을 볼 수 있다.
// 이는 유연한 변수 선언으로 간단한 테스트에는 편리 할 수 있겠으나, 코드량이 많아 진다면 어디에서 어떻게 사용 될지도 파악하기 힘들뿐더러 값이 바뀔 우려가 있다.
// let, const
// 그래서 ES6 이후, 이를 보완하기 위해 추가 된 변수 선언 방식이 let 과 const 이다.
// 위의 코드에서 변수 선언 방식만 바꿔보자.
// name이 이미 선언 되었다는 에러 메세지가 나온다. (const도 마찬가지)
// 변수 재선언이 되지 않는다.

// 그렇다면 let 과 const 의 차이점은 무엇일까?
// 이 둘의 차이점은 immutable 여부이다.
// let 은 변수에 재할당이 가능하다. 그렇지만,const는 변수 재선언, 변수 재할당 모두 불가능하다.

// 3. 정리
// 그렇다면, 어떤 변수 선언 방식을 써야할까?
// 변수 선언에는 기본적으로 const를 사용하고, 재할당이 필요한 경우에 한정해 let 을 사용하는 것이 좋다.
// 그리고 객체를 재할당하는 경우는 생각보다 흔하지 않다. const 를 사용하면 의도치 않은 재할당을 방지해 주기 때문에 보다 안전하다.
// 재할당이 필요한 경우에 한정해 let 을 사용한다. 이때, 변수의 스코프는 최대한 좁게 만든다.
// 재할당이 필요 없는 상수와 객체에는 const 를 사용한다.