import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap';

import { KEYS } from '../utils.js';


/**
 * 서버에 데이터 로드 / 저장 하는 페이지 사용해야하는 부분일듯함
 * Edit a sequence of images. Unlike task_seq.js, this will load and save data to the server each time,
 * rather than saving state.
 * sequence 이미지를 편집합니다. task_seq.js와 달리 매번 서버에 데이터를 로드하고 저장하며,
 * task_seq.js == 상태를 저장
 */

/** EditSequence class 지정*/
export class EditSequence extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      imageIndex: -1,
      fetchingData: true
    };

    this.prevImage = this.prevImage.bind(this);
    this.nextImage = this.nextImage.bind(this);
    this.finish = this.finish.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

  }

  /**componentDidMount()는 컴포넌트가 마운트된 직후, 즉 트리에 삽입된 직후에 호출됩니다
   * DOM 노드가 있어야 하는 초기화 작업은 이 메서드에서 이루어지면 됩니다. 
   * 외부에서 데이터를 불러와야 한다면, 네트워크 요청을 보내기 적절한 위치입니다. */
  // addEventListener : 이 방식을 이용하면 여러개의 이벤트 핸들러를 등록할 수 있다.
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);

    if (this.props.imageIds.length > 0) {

      let nextImageId = this.props.imageIds[0];

      // Get the data for the next image.
      // 다음 이미지에 대한 데이터를 가져옵니다.
      this.getImageData(nextImageId, (imageData) => {

        // Render the next image
        // 다음 이미지 렌더
        this.setState(function (prevState, props) {
          return {
            imageIndex: 0,
            image: imageData.image,
            annotations: imageData.annotations,
            fetchingData: false
          }
        });
      }, () => {
        alert("Failed to load image data");
      });
    }
    this.setState({
      fetchingData: true
    });
  }
  /**componentWillUnmount()는 컴포넌트가 마운트 해제되어 제거되기 직전에 호출됩니다. 
   * 이 메서드 내에서 타이머 제거, 네트워크 요청 취소,
   * componentDidMount() 내에서 생성된 구독 해제 등 필요한 모든 정리 작업을 수행하세요. */
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(e) {

    switch (e.keyCode) {
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

  // image load 부분
  // getImageData () 메소드는 지정된 직사각형 캔버스 화소 데이터의 복사 imageData의 객체를 반환한다.
  // 각 픽셀에 대한 객체 imageData의 정보, 즉 RGBA 값의 네 가지 영역이있다 :
  getImageData(imageId, onSuccess, onFail) {

    let endpoint = "/edit_image/" + imageId;

    $.ajax({
      url: endpoint,
      method: 'GET'
    }).done(function (data) {
      onSuccess(data);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus);
      onFail();
    });

  }

  // ? //
  prevImage() {

    if (this.state.fetchingData) {
      return;
    }

    if (this.state.imageIndex == 0) {
      return;
    }
    else {
      // Get the next image id // 다음 이미지 ID를 가져옵니다
      let nextImageId = this.props.imageIds[this.state.imageIndex - 1];

      // Save the annotations from the current image
      // 현재 이미지의 annotation 저장
      this.taskViewRef.performSave(() => {

        // Get the data for the next image.
        // 다음 이미지에 대한 데이터를 가져옵니다.
        this.getImageData(nextImageId, (imageData) => {

          // Render the next image
          // 다음 이미지 렌더링
          this.setState(function (prevState, props) {
            return {
              imageIndex: prevState.imageIndex - 1,
              image: imageData.image,
              annotations: imageData.annotations,
              fetchingData: false
            }
          });
        }, () => {
          alert("Failed to load image data");
        });
      }, () => {
        alert("Failed to save image data");
      });

      this.setState({
        fetchingData: true
      });
    }

  }

  nextImage() {

    if (this.state.fetchingData) {
      return;
    }

    if (this.state.imageIndex == this.props.imageIds.length - 1) {
      return;
    }
    else {

      // Get the next image id // 다음 이미지 ID를 가져옵니다
      let nextImageId = this.props.imageIds[this.state.imageIndex + 1];

      // Save the annotations from the current image
      // 현재 이미지의 annotation 저장
      this.taskViewRef.performSave(() => {

        // Get the data for the next image.
        // 다음 이미지에 대한 데이터를 가져옵니다.
        this.getImageData(nextImageId, (imageData) => {

          // Render the next image
          // 다음 이미지 렌더링
          this.setState(function (prevState, props) {
            return {
              imageIndex: prevState.imageIndex + 1,
              image: imageData.image,
              annotations: imageData.annotations,
              fetchingData: false
            }
          });
        }, () => {
          alert("Failed to load image data");
        });
      }, () => {
        alert("Failed to save image data");
      });

      this.setState({
        fetchingData: true
      });
    }

  }

  finish() {

    this.props.onFinish();

  }

  render() {

    if (this.state.fetchingData) {
      return (
        <div> Loading Image </div>
      );
    }

    // feedback for the user
    // 사용자에게 피드백
    let current_image = this.state.imageIndex + 1;
    let num_images = this.props.imageIds.length;

    // Determine which buttons we should render
    // 렌더링 버튼 생성
    var buttons = []
    if (this.state.imageIndex > 0) {
      buttons.push(
        (<button key="prevButton" type="button" className="btn btn-outline-secondary" onClick={this.prevImage}>Prev</button>)
      );
    }
    if (this.state.imageIndex < num_images - 1) {
      buttons.push(
        (<button key="nextButton" type="button" className="btn btn-outline-secondary" onClick={this.nextImage}>Next</button>)
      );
    }
    if (this.state.imageIndex == num_images - 1) {
      buttons.push(
        (<button key="finishButton" type="button" className="btn btn-outline-success" onClick={this.finish}>Finish</button>)
      );
    }

    return (
      <div>
        <div className="row">
          <div className="col">
            <this.props.taskView ref={e => { this.taskViewRef = e; }}
              image={this.state.image}
              annotations={this.state.annotations}
              categories={this.props.categories}
              key={this.state.imageIndex}
            />
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

          </div>
        </nav>
      </div>
    )
  }

}

EditSequence.defaultProps = {
  imageIds: [], // Array of image ids // 이미지 ID 배열
  onFinish: null, // a function to call when the image sequence is finished. // 이미지 시퀀스가 완료되면 호출할 함수입니다.
  categories: null // Categories array, // 카테고리 배열
};