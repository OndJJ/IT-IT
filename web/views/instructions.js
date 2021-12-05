import React from 'react';

/* 기본 작성 툴
조정이 필요한 모든 주석을 수정, 드래그 핸들을 사용하여 상자를 수정함 
마커를 끌어 포인트를 수정, 가시성 확인란을 사용하여 구성요소가 표시되는지 여부를 수정합니다.
save 버튼, s 버튼을 눌러 작업을 저장 할 수 있음*/
class DefaultEditInstructions extends React.Component {

  render() {
    return (
      <div className="card card-outline-primary">
        <div className="card-block">
          <h4 className="card-title">Free edit</h4>
          <p className="card-text">Edit any annotations that need adjustment. Use the drag handles to modify boxes. Drag the markers to modify points. Use the visibility checkboxes to modify whether a component is visible or not.</p>
          <p className="card-text">Press the `Save` button to save the annotations, or press the `s` key.</p>
        </div>
      </div>
    );
  }
}

/* keypoint instruction
'v'를 눌러 keypoint 전환합니다. 취소하려면 'esc'를 누르거나 keypoint 해당 사항 없음으로 변경*/
class KeypointInstructions extends React.Component {

  render() {
    return (
      <div className="card card-warning">
        <div className="card-block">
          <h4 className="card-title">Click on the <span className="font-italic font-weight-bold">{this.props.name}</span></h4>
          <p className="card-text">Press `v` to toggle the visibility. Press `esc` or change the visibility to n/a to cancel.</p>
          <p className="card-text">Press the `Save` button to save the annotations, or press the `s` key.</p>
        </div>
      </div>
    );
  }

}

/* BBox Instructions */
class BBoxInstructions extends React.Component {

  render() {
    return (
      <div className="card card-warning">
        <div className="card-block">
          <h4 className="card-title">Click and drag a box around the <span className="font-italic font-weight-bold">{this.props.name}</span></h4>
          <p className="card-text">Press `esc` to cancel.</p>
          <p className="card-text">Press the `Save` button to save the annotations, or press the `s` key.</p>
        </div>
      </div>
    );
  }

}

export { DefaultEditInstructions, KeypointInstructions, BBoxInstructions }