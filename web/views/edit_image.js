import React from 'react';
import ReactDOM from 'react-dom';

import {FullEditView} from './full_edit.js'

/**
 * Edit a single Image / 단일 이미지 편집
 */
/* export let을 통해 외부로 내보내기
document.getElementById(id) : 태그에 있는 id 속성을 사용하여 해당 태그에 접근하여 하고 싶은 작업을 할 때 쓰는 함수*/
export let editImage = function(editData){

    ReactDOM.render(
        <FullEditView image={editData.image}
                      annotations={editData.annotations}
                      categories={editData.categories}/>,
        document.getElementById('app')
    );
}


// Document.getElementById() 메서드는 주어진 문자열과 일치하는 id 속성을 가진 요소를 찾고,
// 이를 나타내는 Element 객체를 반환합니다.ID는 문서 내에서 유일해야 하기 때문에 특정 요소를 빠르게 찾을 때 유용합니다.

// 'app' 이라는 걸 id를 html에서 찾는듯하다.