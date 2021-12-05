import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap';

import {KEYS} from '../utils.js';


/**
 * Perform a task on a sequence of images.
 * 일련의 영상에 대해 작업을 수행합니다.
 */
//  export 문은 JavaScript 모듈에서 함수, 객체, 원시 값을 내보낼 때 사용합니다. 내보낸 값은 다른 프로그램에서 import 문으로 가져가 사용할 수 있습니다.
//  extends 상속의 대표적인 형태 //부모의 메소드를 그대로 사용할 수 있으며 오버라이딩 할 필요 없이 부모에 구현되있는 것을 직접 사용 가능하다.
export class TaskSequence extends React.Component {
    // 리액트 컴포넌트는 두가지 인스턴스 속성을 가진다.
    // props : 부모 컴포넌트 -> 자식컴포넌트
    // state : 컴포넌트내부에서 선언하며 내부에서 값 변경할수있다. 동적인 데이터 다룰때 사용
    // 컴포넌트 간에는 무조건 props를 통해서만 데이터를 주고받고 변경되는 값은 state만큼 확인
    constructor(props) {
        super(props);

        this.state = {
            imageIndex : 0
        };

        this.prevImage = this.prevImage.bind(this);
        this.nextImage = this.nextImage.bind(this);
        this.finish = this.finish.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Initiliaze the saved task state
        // 저장된 작업 상태 초기화
        this.savedTaskState = [];
        for(var i = 0; i < this.props.taskData.length; ++i){
          this.savedTaskState.push(null);
        }

        this.overallStartTime = new Date().getTime() / 1000;
    }

    componentDidMount(){
      document.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount(){
      document.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(e){

      switch(e.keyCode){
        case KEYS.SPACE:
          this.nextImage();
          break;
        case KEYS.LEFT_ARROW:
          this.prevImage();
          break;
        case KEYS.RIGHT_ARROW:
          this.nextImage();
          break
      }

    }

    checkPerformance(onSuccess, onFail){
      /* Give the image a chance to provide feedback to the user.
         사용자에게 이미지 피드백 할 수 있는 기회 제공
      */
      this.taskViewRef.checkPerformance(onSuccess, onFail);
    }

    captureState(){
      /* Save off the annotations. /annotations 저장합니다.
      */

      let endTime = new Date().getTime() / 1000;

      var state = this.taskViewRef.getState();

      // Store the amount of time the user has spent on this task
      // 사용자가 이 작업에 사용한 시간 저장
      let oldState = this.savedTaskState[this.state.imageIndex];
      var time;
      if(oldState == null){
        time = endTime - this.startTime;
      }
      else{
        time = oldState['time'] + endTime - this.startTime;
      }
      state['time'] = time;
      this.savedTaskState[this.state.imageIndex] = state;

    }

    prevImage(){

      this.checkPerformance(()=>{
        this.captureState();

        if(this.state.imageIndex == 0){
          return;
        }
        else{
          this.setState(function(prevState, props){
            return {
              imageIndex : prevState.imageIndex - 1,
            }
          });
        }
      }, ()=>{})
    }

    nextImage(){

      this.checkPerformance(()=>{

        if(this.state.imageIndex == this.props.taskData.length - 1){
          this.finish();
        }
        else{
          this.captureState();
          this.setState(function(prevState, props){
            return {
              imageIndex : prevState.imageIndex + 1
            }
          });
        }
      }, ()=>{})

    }

    finish(){

      this.checkPerformance(()=>{
        this.captureState();

        if(this.props.onFinish != null){

          let overallEndTime = new Date().getTime() / 1000;
          let task_results = {
            'results' : this.savedTaskState,
            'time' : overallEndTime - this.overallStartTime,
            'task_id' : this.props.taskId
          }

          this.props.onFinish(task_results);
        }
      }, ()=>{})
    }

    render() {

      this.startTime = new Date().getTime() / 1000;

      var taskData = this.savedTaskState[this.state.imageIndex];
      if (taskData == null){
        taskData = this.props.taskData[this.state.imageIndex];
      }

      let current_image = this.state.imageIndex + 1; // feedback for the user 사용자에 대한 피드백
      let num_images = this.props.taskData.length;

      // Determine which buttons we should render
      // 렌더링할 buttons 결정
      var buttons = []
      if(this.state.imageIndex > 0){
        buttons.push(
          (<button key="prevButton" type="button" className="btn btn-outline-secondary" onClick={this.prevImage}>Prev</button>)
        );
      }
      if(this.state.imageIndex < num_images - 1){
        buttons.push(
          (<button key="nextButton" type="button" className="btn btn-outline-secondary" onClick={this.nextImage}>Next</button>)
        );
      }
      if(this.state.imageIndex == num_images - 1){
        buttons.push(
          (<button key="finishButton" type="button" className="btn btn-outline-success" onClick={this.finish}>Finish</button>)
        );
      }

      var modalButtons = [];
      if (this.props.taskInstructionModalId != null){
        modalButtons.push(<button key="helpModal" type="button" className="btn btn-outline-primary" data-toggle="modal" data-target={"#" + this.props.taskInstructionModalId}>Help</button>);
      }
      if (this.props.taskHotKeysModalId != null){
        modalButtons.push(<button key="hotKeysModal" type="button" className="btn btn-outline-primary" data-toggle="modal" data-target={"#" + this.props.taskHotKeysModalId}>Hot Keys</button>);
      }

      return (
        <div>
          <div className="row">
            <div className="col">
              <this.props.taskView ref={ e => { this.taskViewRef = e; }}
                              image={taskData.image}
                              annotations={taskData.annotations}
                              categories={this.props.categories}
                              key={this.state.imageIndex}
                              visualize={this.props.visualize}/>
            </div>
          </div>

          <nav className="navbar fixed-bottom navbar-light bg-light">
            <div className="ml-auto">
                <div className="btn-group" role="group">
                  {buttons}
                </div>
                  <span> Image {current_image} / {num_images} </span>
            </div>
            <div className="ml-auto">
                {modalButtons}
            </div>
          </nav>
        </div>
      )
    }

}

TaskSequence.defaultProps = {
  taskData : [], // Array of image dicts  // 이미지 받아쓰기 배열  //
  onFinish : null, // a function to call when the image sequence is finished. // 영상 시퀀스가 완료되면 호출하는 함수입니다. //
  categories : null, // Categories array,  // 카테고리 배열,  //
  taskInstructionModalId : null,
  taskHotKeysModalId: null,
  visualize: false // Are we visualizing the results of a task?  // 작업 결과를 시각화하고 있습니까?
};