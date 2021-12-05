/* 이미지 관련 생성 / 저장 관련 설정이 있는 페이지 */
/* 참고 url : https://velog.io/@surim014/AJAX%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80 
              https://berkbach.com/%EA%B8%B0%EC%B4%88%EB%B6%80%ED%84%B0-%EB%B0%B0%EC%9A%B0%EB%8A%94-react-js-1531b18f7bb2
              https://firework-ham.tistory.com/29
              https://ljh86029926.gitbook.io/coding-apple-react/undefined/this 
              https://beam307.github.io/2017/12/05/ajax/
              http://tcpschool.com/ajax/ajax_jquery_ajax */

/* react목적만을 위한 것으로 컴포넌트를 생성하거나 jsx요소를 작성하도록 하는데 목적을 둔 import. */
import React from 'react';
/* react가 아니어도 사용되는 것으로 dom과 상호작용을 하는데 사용된다. */
import ReactDOM from 'react-dom';
/* {export} 내보내는 파일에 default가 붙어있지 않다면 중괄호가 필요함*/
import { ImageLoader } from './image_loader.js';
import { TaskSequence } from './task_seq.js';
import { BBoxAnnotation } from './bbox_annotation.js';
import { TaskInstructions } from './task_instructions.js';

import { MTurkFinishWrapper } from '../mturk.js';

/*BBoxTask 생성 React.Component 상속 */
class BBoxTask extends React.Component {
  /* state : 데이터를 다룰 때 사용하는 개념 , 하나의 컴포넌트(요소)가 가질 수 있는 변경 가능한 데이터
     props : 데이터를 다룰 때 사용하는 개념 , 현재 컴포넌트 내에서 변경 불가능 / 읽기 전용
          - Props와 State 모두 하위 컴포넌트에 상속이 가능 -  */

  /*React는 Component를 생성할 때 state 값을 초기화하거나 메서드를 바인딩할 때 construcotr()를 사용 
  React.Component를 상속한 컴포넌트의 생성자를 구현할 때는 super(props)를 선언을 권고한다. 
  이유는 this.props 사용 시 생성자 내에서 정의되지 않아 버그 발생 가능성이 생기기 때문이다.*/
  constructor(props) {
    super(props);
    /*constructor()를 사용할때 this.state로 초기값을 할당해주어야 한다.
    생성자는 this.state를 직접 할당할 수 있는 곳으로 그 외에는 꼭 this.setState()를 사용해야함
    추가 - 생성자 내에서는 구독 작업이나 외부 API 호출을 하면 안된다 / 외부 API 호출이 필요하다면 componentDidMount()를 사용하자 
    componentWillMount()를 사용했다면 분들이라면 componentDidMount()로 함수를 수정해주세요.
    React에서 componentWillMount를 삭제 예정이므로 componentDidMount를 사용하자 */
    this.state = {
      imageElement: null
    };

    /*this : 부모를 가르키는 함수 
      bind() : this를 고정시킬 때 사용하는 방법이다.
      - 여기서는 this를 인자로 넣었기 때문에 부모를 고정시켰다. */
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
    this.handleImageFailed = this.handleImageFailed.bind(this);
    this.saveAnnotations = this.saveAnnotations.bind(this);

    this.start_time = null;
    this.end_time = null;
  }
  /*이미지 로드 */
  handleImageLoaded(imageElement) {
    this.setState({
      imageElement: imageElement
    });
  }
  /*이미지 로드 실패 문구 */
  handleImageFailed() {
    /**cosole.log는 참조를 로깅하기 때문에, 객체와 같이 내용물이 변할 수 있는 것들은 내용이 실시간으로 바뀔 수 있음. */
    console.log('Image failed to load');
  }
  /* 저장 */
  performSave() {
    if (this.leafletImage != 'undefined' && this.leafletImage != null) {
      this.leafletImage.handleSave();

      var annotations = this.leafletImage.getAnnotations();

      if (annotations.length == 0) {
        annotations
      }

      // tack on some extra information

    }
  }

  /* 상태 get */
  getState() {
    return this.leafletImage.getState();
  }

  /* 성능 확인
    gold(?) 질문을 처리하기 위한 자리  */
  checkPerformance(onSuccess, onFail) {
    // This is a placeholder for handling gold questions
    onSuccess();
  }

  /* 주석 저장 */
  saveAnnotations(annotations) {
    //console.log("saving annotations");

    // Tack on some extra information
    for (var i = 0; i < annotations.length; i++) {

    }
    /* ajax : Asynchronous Javascript And Xml(비동기식 자바스크립트와 xml)의 약자
       자바스크립트를 이용해 서버와 브라우저가 비동기 방식으로 데이터를 교환할 수 있는 통신 기능
       브라우저가 가지고있는 XMLHttpRequest 객체를 이용해서 전체 페이지를 새로 고치지 않고도 페이지의 일부만을 위한 데이터를 로드하는 기법
       쉽게 말하자면 자바스크립트를 통해서 서버에 데이터를 비동기 방식으로 요청하는 것이다. ( 페이지 전환 시 핸드폰 app처럼 전환 부드럽다. ) */
    $.ajax({
      url: "/bbox_task/save", // 요청할 서버url
      method: 'POST',
      /*JSON.stringify( )는 자바스크립트의 값을 JSON 문자열로 변환한다. 
        $.ajax 호출시 success, error 혹은 done, fail 을 사용하여 서버 통신 결과를 콜백 처리 할 수 있다.*/
      data: JSON.stringify({ 'annotations': annotations }), // 보낼 데이터 (Object , String, Array)
      contentType: 'application/json'
      // // HTTP 요청이 성공하면 요청한 데이터가 done() 메소드로 전달됨.
    }).done(function () {
      console.log("saved annotations");
      // HTTP 요청이 실패하면 오류와 상태에 관한 정보가 fail() 메소드로 전달됨.
    }).fail(function () {

    });
  }

  render() {

    if (this.state.imageElement == null) {
      return (
        <ImageLoader url={this.props.image.url}     // 이미지 미리 보는 imageLoader() 함수
          onImageLoadSuccess={this.handleImageLoaded}
          onImageLoadError={this.handleImageFailed} />
      )
    }
    else {

      // Can the boxes be edited? / bounding box 수정
      var enableEditing = true;
      // Can the user immediately draw a box? / bounding box 그리기
      var startNewInstance = true;
      if (this.props.visualize) {
        enableEditing = false;
        startNewInstance = false;
      }

      return (
        <div>
          <div className="row">
            <div className="col">
              <BBoxAnnotation ref={m => { this.leafletImage = m; }}  // ref 를 통해 BBoxAnnotation에서 leafletImage에 접근 할 수 있도록 설정
                imageElement={this.state.imageElement}
                image={this.props.image}
                annotations={this.props.annotations}
                categories={this.props.categories}
                enableEditing={enableEditing}
                startNewInstance={startNewInstance}
                onSave={this.saveAnnotations} />
            </div>
          </div>
        </div>
      );
    }
  }

}
// 메인 드라이버. 지침을 표시한 다음 작업 순서를 시작하는 핸들
// Main driver. Handles showing the instructions, and then kicking off the task sequence,
// 결과를 서버로 다시 보냅니다.
// and then sending the results back to the server.
// export let을 통해 bboxTask 함수 내보냄
export let bboxTask = function (taskId, taskData, categories, mturk, taskInstructions) {

  // 작업 결과 저장
  var onFinish;
  function submit(taskResults, onSuccess, onFailure) {
    $.ajax({
      url: "/bbox_task/save",
      method: 'POST',
      data: JSON.stringify(taskResults),
      contentType: 'application/json'
    }).done(function () {
      console.log("Successfully saved bbox task results");

      if (onSuccess) {
        onSuccess();
      }

      // Show finished page  // 성공시 페이지 닫기
      ReactDOM.render(
        (<div className="alert alert-success" role="alert">
          Finished!
        </div>),
        document.getElementById('app')
      );

    }).fail(function () {
      console.log("ERROR: failed to save bbox task results"); // 저장 실패시

      if (onFailure) {
        onFailure();
      }

      // Show finished page // 실패시 페이지 닫기
      ReactDOM.render(
        (<div className="alert alert-danger" role="alert">
          Finished, but there was a problem saving the results.
        </div>),
        document.getElementById('app')
      );
    });
  }

  if (mturk) {
    onFinish = MTurkFinishWrapper(submit);
  }
  else {
    onFinish = submit;
  }

  // Function to start the TaskSequence // 작업 시작
  function onStart() {
    ReactDOM.render(
      <TaskSequence taskId={taskId} taskData={taskData} taskView={BBoxTask} categories={categories} onFinish={onFinish} taskInstructionModalId="bboxTaskHelpModal" taskHotKeysModalId="bboxTaskHotKeysModal" visualize={false} />,
      document.getElementById('app')
    );
  }
  // Show the Start Page with the Task Instructions
  // 작업 지침이 포함된 시작 페이지 표시
  ReactDOM.render(
    <TaskInstructions {...taskInstructions} onStart={onStart} />,
    document.getElementById('app')
  );

}

// export let을 통해 bboxTaskVisualize 함수 내보냄
export let bboxTaskVisualize = function (taskData, categories) {
  ReactDOM.render(
    <TaskSequence taskData={taskData} taskView={BBoxTask} categories={categories} visualize={true} />,
    document.getElementById('app')
  );
}
