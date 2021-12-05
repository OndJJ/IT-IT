import { editImage } from './views/edit_image.js';
import { editTask } from './views/edit_task.js';
import { bboxTask } from './views/bbox_task.js';


// filename / path 사용 용도에 맞게 수정 필요
ReactDOM.render(
    <BrowserRouter>
        <Route exact path='/path' component={ filename } />
        <Route exact path='/path' component={ filename } />
    </BrowserRouter>
    , document.getElementById('root')
);

document.V = Object();
// Object 생성자 함수를 호출하여 빈 객체를 생성할 수 있다. 빈 객체 생성 이후 프로퍼티 또는 메서드를 추가하여 객체를 완성한다.

// Edit annotations in a dataset
// dataset안에서 주석 작성
document.V.editImage = editImage;
document.V.editTask = editTask;

// Bounding box annotation task
// Bounding box 주석 작업
document.V.bboxTask = bboxTask;









// var person = new Object();

// person.name = 'Lee';
// person.gender = 'male';
// person.sayHello = function () {
//     console.log('Hi! My name is' + this.name);
// }
// console.log(typeof person); 


// Object() : 생성자함수, 생성자를 호출하고 new를 붙여야 인스턴스가 생성
// 인스턴스(instance) : 객체 지향 프로그래밍에서 클래스에 소속된 개별적인 객체를 말한다.
//                     즉 하나의 클래스를 사용하여 유사한 성질을 가진 수많은 인스턴스를 생성할 수 있고,
//                     이 때 추상적 개념인 클래스에서 실제 객체를 생성하는 것을 instantiation(인스턴스화) 한다고 말한다.
//                     객체가 메모리에 할당되어 실제 사용될때 인스턴스
