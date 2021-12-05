import React from 'react';

/*
 * Load an image, perhaps with a spinner, etc.
    스피너 등을 사용하여 이미지 로드
 */
// export를 통해 class로 지정된 ImageLoader를 외부로 내보낸다.
export class ImageLoader extends React.Component {
// constructor(props) 초기 설정
    constructor(props) {
        super(props);
        //  this.onImageLoaded.bind(this) : 가르키는 부모 값이 변동이 없게 bind(this)
        this.onImageLoaded = this.onImageLoaded.bind(this);
        this.onImageErrored = this.onImageErrored.bind(this);
    }

    onImageLoaded() {
        this.props.onImageLoadSuccess(this.image);
    }

    onImageErrored() {
        this.props.onImageLoadError();
    }

    render() {

        return(
            <div style={{display : 'none'}}>
                <img
                    ref={i => { this.image = i; }} // 연결 
                    src={this.props.url} // 연결
                    onLoad={this.onImageLoaded} // 성공시 설정
                    onError={this.onImageErrored} // 실패시 설정
                />
                Loading Image
            </div>
        )

    }
}