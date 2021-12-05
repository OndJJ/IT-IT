import React from 'react';

/**
 * 카테고리에 관한 페이지, 필요하다 판단 되면 자세하게 살펴봐야함
 * This renders a modal for category selection.
 * 카테고리 선택을 위한 modal 렌더링
 */
export class CategorySelectionModal extends React.Component {

  constructor(props) {
    super(props);

    // want to add an index to the categories
    // 카테고리에 index 추가
    // Object.assign() 메서드는 출처 객체들의 모든 열거 가능한 자체 속성을 복사해 대상 객체에 붙여넣습니다. 
    // 그 후 대상 객체를 반환합니다.(병합을 쉽게 해줌, 첫번째 인자 = 타켓, 나머지 = 소스)
    var data = [];
    for (var i = 0; i < this.props.categories.length; i++) {
      var cat = Object.assign({}, this.props.categories[i]);
      cat.idx = i;
      data.push(cat);
    }

    this.state = {
      data: data,
      filteredData: data
    };

    this.filterData = this.filterData.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  shown() {
    this.filterInput.focus();
  }

  onCancel() {
    this.props.cancelled();
  }

  // parseInt() = 문자열을 정수로 바꾸는 함수
  onSelect(e) {
    let idx = parseInt(e.target.dataset.idx);
    this.props.selected(idx);
  }

  // 참고 url : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/RegExp
  filterData(e) {
    e.preventDefault();
    let regex = new RegExp(e.target.value, 'i');  // new RegExp 생성자는 패턴을 사용해 텍스트를 판별할 때 사용
    let filtered = this.state.data.filter((category) => {
      return category.name.search(regex) > -1;
    });
    this.setState({
      filteredData: filtered
    });
  }

  render() {

    let filteredCategories = this.state.filteredData;

    var categoryEls = [];
    for (var i = 0; i < filteredCategories.length; i++) {
      let cat = filteredCategories[i];
      categoryEls.push((
        <li key={cat.idx}>
          <button data-idx={cat.idx} type="button" className="btn btn-outline-primary" onClick={this.onSelect}>{cat.name}</button>
        </li>
      ));
    }

    return (
      <div>
        <div className="modal-header">
          <h5 className="modal-title" id="categorySelectionModalLabel">Category Selection</h5>
        </div>
        <div className="modal-body">
          <input ref={(input) => { this.filterInput = input; }} type='text' onChange={this.filterData}></input>
          <ul id="categorySelectionModalCategoryList">{categoryEls}</ul>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={this.onCancel}>Cancel</button>
        </div>
      </div>
    );
  }

}