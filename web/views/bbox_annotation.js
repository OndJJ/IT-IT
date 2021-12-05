import React from 'react';
import $ from 'jquery';
import 'bootstrap';

import L from 'leaflet';
import '../leaflet.draw/leaflet.draw-src.js';

import { COLORS, KEYS } from '../utils.js';
import { Annotation } from './annotation.js';
import { BBoxInstructions } from './instructions.js';

/* BBoxInstance class 지정  */
class BBoxInstance extends React.Component {

  constructor(props) {
    super(props);

    //this.keypointVisibilityChanged = this.keypointVisibilityChanged.bind(this);
    this.deleteRequested = this.deleteRequested.bind(this); // bind()를 통해 가르키는 부모가 바뀌지않게 고정

    this.onMouseEnter = this.onMouseEnter.bind(this); // bind()를 통해 가르키는 부모가 바뀌지않게 고정
    this.onMouseLeave = this.onMouseLeave.bind(this); // bind()를 통해 가르키는 부모가 바뀌지않게 고정
    this.onFocus = this.onFocus.bind(this); // bind()를 통해 가르키는 부모가 바뀌지않게 고정
    //this.onAnnotateNA = this.onAnnotateNA.bind(this);
    this.onHideOthers = this.onHideOthers.bind(this); // bind()를 통해 가르키는 부모가 바뀌지않게 고정
  }

  deleteRequested() {
    this.props.handleDelete(this.props.id); // handleDelete 연결
  }

  onMouseEnter() {

  }

  onMouseLeave() {

  }

  onFocus() {
    this.props.handleFocus(this.props.id); // handleFocus 연결
  }

  onHideOthers() {
    this.props.handleHideOthers(this.props.id); // handleHideOthers
  }

  render() {

    let annotation_color = COLORS[this.props.id % COLORS.length]; // annotation_color 변수 설정

    // Are we hidden? // props == hidden일 경우
    var hiddenBadge = "";
    if (this.props.hidden) {
      hiddenBadge = <span className="badge badge-secondary mr-1">Hidden</span>;
    }
    //<span className="badge mr-1" style={{backgroundColor: annotation_color}}>&#9634;</span>
    return (
      <div className="card">
        <div role="tab" id={"annotationHeader" + this.props.id}
          onMouseEnter={this.onMouseEnter}  // function call
          onMouseLeave={this.onMouseLeave}>
          <div className="d-flex justify-content-between">
            <div className="p-2">
              <span className="badge px-2 mr-1" style={{ backgroundColor: annotation_color }}></span>
              <span>{this.props.category.name}</span>
            </div>
            <div className="p-2">

              {hiddenBadge}
              /* deleteRequested 버튼 생성 */
              <button type="button" className="btn btn-sm btn-danger" onClick={this.deleteRequested}>Delete</button>

            </div>
          </div>
        </div>
      </div>
    );

  }

}

/* BBoxAnnotation class 지정 export를 통해 외부 공유 */
export class BBoxAnnotation extends React.Component {

  // Create the leaflet map and render the image

  constructor(props) {
    super(props);

    this.state = {
      annotations: this.props.annotations, // Current state of the annotations // 현재 주석 상태
      annotating: false // Are we currently anntating something? // 현재 뭔가를 설명하고 있습니까? == false
    };

    // This will hold the leaflet layers that correspond to the annotations stored in `this.state.annotations`
    // It is a mirror of this.state.annotations
    /*`this.state.annotations`에 저장된 주석에 해당하는 leaflet layers 보유
    /* this.state.annotations의 미러입니다. */
    this.annotation_layers = null;

    // Properties used to track annotation status // 주석 상태를 추적하는 데 사용되는 속성

    /*사용자가 실제로 주석을 달았는지 아니면 단순히 이미지를 클릭했는지 확인하는데 사용 */
    this._drawSuccessfullyCreated = null; // used to determine if the user actually made an annotation or simply clicked on the image

    /*주석을 만드는 데 사용되는 변수 */
    this._currentDrawer = null; // the current drawer used for making the annotation

    /* 키포인트 주석 */
    this.annotating_keypoint = null; // Are we annotating a keypoint?

    /* bbox 주석 */
    this.annotating_bbox = null; // Are we annotating a bbox?

    /* 특정 주석을 수정 여부 / this.state.annotations에 대한 인덱스 생성 */
    this.current_annotationIndex = null; // Which annotation are we modifing? This indexes into this.state.annotations

    /* 특정 키포인트에 수정 여부  / this.state.annotations[<i>].keypoints에 대한 인덱스 생성 */
    this.current_keypointIndex = null; // Which keypoint are we annotating? This indexes into this.state.annotations[<i>].keypoints

    /* 새 인스턴스를 생성하는 경우 해당 인스턴스 범주 */
    this.new_category_id = null; // If we are creating a new instance, then which category does it belong to?

    // Used when creating a new instance and we want to annotate all of the keypoints
    // 새 인스턴스를 생성할 때 사용되며 모든 키포인트에 주석을 달고 싶을때 사용 == True
    this.annotate_keypoints_for_new_instances = true; // When we create a new instance, should we annotate all of the keypoints automatically?
    this.annotation_keypoint_queue = []; // A queue of keypoints to annotate. // 주석을 추가할 키포인트 순서

    // create a map from category id to category info, this is for convenience
    // 편의를 위해 카테고리 ID에서 카테고리 정보까지의 맵을 생성
    this.categoryMap = {};
    for (var i = 0; i < this.props.categories.length; i++) {
      var category = this.props.categories[i]
      this.categoryMap[category['id']] = category;
    }

    // BBox cross hair div elements:
    this.bbox_crosshairs = null;

    //this.handleKeypointVisibilityChange = this.handleKeypointVisibilityChange.bind(this);
    this.createNewInstance = this.createNewInstance.bind(this);
    this.cancelBBoxAnnotation = this.cancelBBoxAnnotation.bind(this);
    this.handleAnnotationDelete = this.handleAnnotationDelete.bind(this);
    this.handleSave = this.handleSave.bind(this);
    //this.checkKeypointAnnotationQueue = this.checkKeypointAnnotationQueue.bind(this);
    this.handleAnnotationFocus = this.handleAnnotationFocus.bind(this);
    //this.handleAnnotateKeypoints = this.handleAnnotateKeypoints.bind(this);
    this.hideOtherAnnotations = this.hideOtherAnnotations.bind(this);
    this.hideAllAnnotations = this.hideAllAnnotations.bind(this);
    this.showAllAnnotations = this.showAllAnnotations.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.bboxCursorUpdate = this.bboxCursorUpdate.bind(this);

  }

  // Add the image overlay and render the annotations.
  // 이미지 오버레이를 추가하고 annotations 렌더링합니다.
  componentDidMount() {

    // Create the leaflet map
    this.leafletMap = L.map(this.leafletHolderEl, {
      center: [0, 0],
      zoom: 0,
      crs: L.CRS.Simple,
      zoomControl: true,
      maxBoundsViscosity: 0.5,
      drawControlTooltips: false
    });
    const leafletMap = this.leafletMap;

    // Determine the resolution that the image will be rendered at
    // 이미지가 렌더링될 해상도를 결정합니다.

    let pixel_bounds = leafletMap.getPixelBounds();
    let maxWidth = pixel_bounds.max.x - pixel_bounds.min.x;
    let maxHeight = pixel_bounds.max.y - pixel_bounds.min.y;

    let imageWidth = this.props.imageElement.width;
    let imageHeight = this.props.imageElement.height;

    let ratio = [maxWidth / imageWidth, maxHeight / imageHeight];
    ratio = Math.min(ratio[0], ratio[1]);

    let height = ratio * imageHeight;
    let width = ratio * imageWidth;

    // Save off the resolution of the image, we'll need this
    // for scaling the normalized annotations
    /*정규화된 annotations 크기 조정을 위한 이미지의 해상도 저장 */

    this.imageWidth = width;
    this.imageHeight = height;

    // Restrict the map to the image bounds
    // 지도를 이미지 경계로 제한
    let southWest = leafletMap.unproject([0, height], leafletMap.getMinZoom());
    let northEast = leafletMap.unproject([width, 0], leafletMap.getMinZoom());
    let bounds = new L.LatLngBounds(southWest, northEast);
    // GVH: The order of these calls matter! // 호출 순서가 중요!
    leafletMap.fitBounds(bounds, {
      animate: false,
      duration: 0
    });
    leafletMap.setMaxBounds(bounds);

    // Render the image on the map // 지도에 이미지 렌더링
    let image = L.imageOverlay(this.props.imageElement.src, bounds).addTo(leafletMap);

    // Add the feature group that will hold the annotations
    // All layers added to this feature group will be editable
    /* 주석을 저장할 FeatureGroup 추가 FeatureGroup에 추가된 모든 레이어는 편집 가능합니다. */
    this.annotationFeatures = new L.FeatureGroup().addTo(leafletMap);

    // Initialize the editor // 편집기 초기화
    this.editor = new L.EditToolbar.Edit(leafletMap, { featureGroup: this.annotationFeatures });

    // set up the event listeners
    // Drawing / Editing / Deleting Events
    /*이벤트 리스너 설정 = 이벤트 그리기 / 편집 / 삭제 */
    leafletMap.on('draw:drawstart', this._drawStartEvent, this);
    leafletMap.on('draw:drawstop', this._drawStopEvent, this);
    leafletMap.on('draw:created', this._drawCreatedEvent, this);
    leafletMap.on('draw:editmove', this._layerMoved, this);
    leafletMap.on('draw:editresize', this._layerResized, this);

    leafletMap.on('draw:drawvertex', this._vertexDrawn, this);


    // We'll use this list to mirror the json annotations
    // 이 list를 사용하여 json 주석을 미러링
    this.annotation_layers = [];

    // Add the annotations // annotations 추가
    for (var i = 0; i < this.state.annotations.length; i++) {
      this.annotation_layers.push(this.addAnnotation(this.state.annotations[i], i));
    }

    // Register keypresses // 키 입력 등록
    document.addEventListener("keydown", this.handleKeyDown);


    if (this.props.startNewInstance) {
      // Have the user add a new instance // 사용자가 새 인스턴스를 추가하도록 합니다.
      this.createNewInstance();
    }
    else if (this.props.enableEditing) {
      // Let the user edit boxes // 사용자가 상자를 편집하도록 허용
      this.enableEditing();
    }

  }

  componentWillUnmount() {
    // Unregister keypresses // 키 입력 등록 취소
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(e) {

    switch (e.keyCode) {
      case KEYS.ESCAPE:
        if (this.state.annotating) {

          // Clear the annotation keypoint queue // 주석 keypoint queue 지우기
          this.annotation_keypoint_queue = [];

          if (this.annotating_keypoint) {
            this.cancelKeypointAnnotation();
          }
          else if (this.annotating_bbox) {
            this.cancelBBoxAnnotation();
          }

        }
        break;

      case KEYS.D:
        this.createNewInstance();
        break;
      case KEYS.H:
        this.hideAllAnnotations();
        break;
      case KEYS.S:
        this.showAllAnnotations();
        break;
    }

  }

  createBBoxPathStyle(color) {
    return {
      'stroke': true,
      'color': color,
      'weight': 4,
      'opacity': 1,
      'fill': false,
      'fillColor': color,
      'fillOpacity': 0.2
    }
  }

  /**
   * Add an annotation to the image. This will render the bbox and keypoint annotations.
   * 이미지에 annotation 추가 그러면 bbox 및 keypoint annotations 렌더링됩니다.
   * @param {*} annotation
   * @param {*} annotationIndex
   */
  addAnnotation(annotation, annotationIndex) {

    let imageWidth = this.imageWidth;
    let imageHeight = this.imageHeight;

    // Get the category for this instance, we need to access the keypoint information
    // 인스턴스의 카테고리를 얻으려면 keypoint 정보에 접근해야 함
    var category = null;
    if (annotation['category_id'] != 'undefined') {
      category = this.categoryMap[annotation['category_id']];
    }

    // Store the layers for this annotation // annotation 대한 layers 저장
    var layers = {
      'bbox': null,
      'keypoints': null,
    };

    // Add the bounding box // bounding box 추가
    if (annotation.bbox != 'undefined' && annotation.bbox != null) {

      let color = COLORS[annotationIndex % COLORS.length];
      let pathStyle = this.createBBoxPathStyle(color)

      var [x1, y1, w, h] = annotation.bbox;
      x1 = x1 * imageWidth;
      y1 = y1 * imageHeight;
      let x2 = x1 + w * imageWidth;
      let y2 = y1 + h * imageHeight;
      let bounds = L.latLngBounds(this.leafletMap.unproject([x1, y1], 0), this.leafletMap.unproject([x2, y2], 0));
      let layer = L.rectangle(bounds, pathStyle);

      this.addLayer(layer);
      layers.bbox = layer;

    }

    return layers;

  }

  /**
   * Allow the user to draw a bbox. // 사용자가 bbox를 그릴 수 있도록 합니다.
   */
  annotateBBox() {

    let index = this.state.annotations.length;
    let color = COLORS[index % COLORS.length];
    let pathStyle = this.createBBoxPathStyle(color);

    let drawer = new L.Draw.Rectangle(this.leafletMap, {
      shapeOptions: pathStyle,
      showArea: false,
      metric: false
    });

    this._currentDrawer = drawer;
    this._drawSuccessfullyCreated = false;

    drawer.enable();

  }

  /**
   * Allow all annotation layers to be edited. // 모든 annotation layers를 편집할 수 있음
   */
  enableEditing() {
    this.editor.enable();
    // Remove the edit styling for the markers. // markers 편집 스타일을 제거합니다.
    $(".leaflet-marker-icon").removeClass("leaflet-edit-marker-selected");
  }

  /**
   * Fix all annotations. // 모든 annotation 수정
   */
  disableEditing() {
    this.editor.disable();
  }

  _vertexDrawn(e) {
    console.log("vertex drawn");
  }

  /**
   * We want cross hairs across the map when drawing a box. // 상자를 그릴 때 지도를 가로 세로선 그리기
   * @param {*} e
   */
  bboxCursorUpdate(e) {

    let ch_horizontal = this.bbox_crosshairs[0];
    let ch_vertical = this.bbox_crosshairs[1];

    let offset = $(this.leafletHolderEl).offset();

    let x = e.pageX - offset.left;
    let y = e.pageY - offset.top;

    ch_horizontal.style.top = y + "px";
    ch_vertical.style.left = x + "px";

    //console.log("x= " + e.pageX + "  y= " + e.pageY);
  }

  _drawStartEvent(e) {
    //console.log("draw start");

    if (this.annotating_bbox) {

      // If the user clicks on the image (rather than clicking and dragging) then this
      // function will be called again, but we don't want to duplicate the cross hairs.
      /* 사용자가 이미지를 클릭하면(클릭하고 드래그하는 대신) 이 함수가 다시 호출되지만 십자선 복제 x */
      if (this.bbox_crosshairs == null) {

        // Setup cross hair stuff
        let ch_horizontal = document.createElement('div');
        let ch_vertical = document.createElement('div');

        ch_horizontal.className = "full-crosshair full-crosshair-horizontal";
        ch_vertical.className = "full-crosshair full-crosshair-vertical";

        ch_horizontal.style.top = "" + e.offsetY + "px";
        ch_vertical.style.left = "" + e.offsetX + "px";

        this.bbox_crosshairs = [ch_horizontal, ch_vertical];

        $(this.leafletHolderEl).append(ch_horizontal);
        $(this.leafletHolderEl).append(ch_vertical);
        $(this.leafletHolderEl).on('mousemove', this.bboxCursorUpdate);

      }
    }
  }

  /**
   * Check to see if the user successfully created the annotation (rectangle or marker).
   * If they didn't, then re-enable the drawer. This can occur (for example) when a user
   * clicks on the image when trying to draw a rectangle.
   * 사용자가 annotation(사각형 또는 마커)을 성공적으로 생성했는지 확인합니다.
   * 그렇지 않은 경우 re-enable the drawer 다시 활성화하십시오.
   * 사각형을 그리려면 이미지를 클릭합니다.
   * 
   * 
   * @param {*} e
   */
  _drawStopEvent(e) {
    //console.log("draw stop");

    // The user triggered some click, but didn't successfully create the annotation.
    // 사용자가 일부 클릭을 실행했지만 annotation을 성공적으로 만들지 못했습니다.
    if (this.state.annotating && !this._drawSuccessfullyCreated) {
      this._currentDrawer.enable();
    }
    else {
      // Always turn off the mouse move
      // 마우스 움직임 끄기
      $(this.leafletHolderEl).off('mousemove', this.bboxCursorUpdate);
      if (this.bbox_crosshairs != null) {
        let ch_horizontal = this.bbox_crosshairs[0];
        let ch_vertical = this.bbox_crosshairs[1];
        $(ch_horizontal).remove();
        $(ch_vertical).remove();
        this.bbox_crosshairs = null;
      }
    }

  }

  /**
   * Save off the annotation layer that was just created.
   * 방금 생성한 annotation layer 저장
   * @param {*} e
   */
  _drawCreatedEvent(e) {
    //console.log("draw created");

    // This is confusing, but we need to use another state variable
    // to decide if the user "messed up" the annotation:
    //		doing a single click for a bounding box, etc.
    /*혼란스럽지만 다른 상태 변수를 사용해야 합니다.
      사용자가 annotation을 "망쳤는지" 결정하기:
      bounding box 등을 한 번 클릭합니다. */
    this._drawSuccessfullyCreated = true;

    var layer = e.layer;

    if (this.annotating_bbox) {

      // We want to clamp the box to the image bounds.
      // 상자를 이미지 경계에 고정
      layer = this.restrictBoxLayerToImage(layer);

      // Ensure that the layer is valid (null signifies the box has no area, or is completely off the image)
      // layer가 유효한지 확인(null은 상자에 영역이 없거나 이미지에서 완전히 벗어남을 나타냄).
      if (layer != null) {
        // This is a new instance. Grab the category that was chosen by the user for the new instance.
        // 새 인스턴스에 대해 사용자가 선택한 범주를 가져옵니다.
        let category = this.categoryMap[this.new_category_id];

        // Create the annotation data structure
        // annotation 데이터 구조 생성
        var annotation = {
          'image_id': this.props.image.id,
          'category_id': category.id,
          'bbox': null,
          'keypoints': null
        };


        // Create a mirror to hold the annotation layers
        // annotation layer를 담을 mirror 생성
        var annotation_layer = {
          'bbox': layer,
          'keypoints': null
        };
        this.annotation_layers.push(annotation_layer);

        // Add the layer to the map // 지도에 레이어 추가
        this.addLayer(layer);

        // Add the annotation to our state // state에 annotation 추가
        this.setState(function (prevState, props) {
          var annotations = prevState.annotations;
          annotations.push(annotation);
          return {
            'annnotations': annotations
          };
        });
      }
    }

    // Unset all of the annotation properties
    // 모든 annotation 속성 설정 해제
    this._currentDrawer = null;
    this.current_annotationIndex = null;
    this.current_keypointIndex = null;
    this.annotating_keypoint = false;
    this.annotating_bbox = false;
    this.new_category_id = null;

    this.setState({
      'annotating': false
    });//, this.checkKeypointAnnotationQueue.bind(this));

    // Can the user edit boxes?
    // 사용자가 상자를 편집?
    if (this.props.enableEditing) {
      this.enableEditing();
    }

  }

  _layerMoved(e) {
    //console.log("layer moved");

  }

  _layerResized(e) {
    //console.log("layer resized");

  }

  /**
   * Allow the user to annotate a new instance with a bbox.
   * 사용자가 bbox로 새 인스턴스에 annotate을 달 수 있도록 허용합니다.
   */
  createNewInstance() {

    if (this.state.annotating) {
      // ignore, the user needs to finish their annotation.
      // Maybe we can flash a message
      // 무시하려면 사용자가 주석을 완료해야 합니다., 메시지를 깜박일 수 있습니다.

      return;
    }

    // if there is only one category, then this is real easy./ 카테고리가 하나만 있다면 쉬운 작업이다.
    var category;
    if (this.props.categories.length == 1) {
      category = this.props.categories[0];

      // Draw a box // box 그리기
      this.disableEditing();
      this.annotating_bbox = true;
      this.new_category_id = category.id; // store the category that was selected. // 선택한 카테고리를 저장합니다.
      this.annotateBBox();
      this.setState({
        'annotating': true,
      });

    }
    else {
      // How do we want the user to select the category?
      // Modal window?
      // edit the category afterwards?
      // what about a default category then?
      // or most recent category?
      // modal with an autocomplete and scroll view?
      /* 사용자가 카테고리를 어떻게 선택하기를 원합니까?
        모달 창? / 나중에 카테고리를 편집하시겠습니까? /기본 카테고리?
        가장 최근 카테고리? / 자동 완성 및 스크롤 뷰가 있는 모달? */

    }



  }

  /**
   * Cancel a bbox annotation.
   * bbox annotation 취소
   */
  cancelBBoxAnnotation() {

    this._drawSuccessfullyCreated = true;
    this._currentDrawer.disable();
    this._currentDrawer = null;

    this.annotating_bbox = false;
    this.new_category_id = null;

    this.setState({
      'annotating': false,
    });
    if (this.props.enableEditing) {
      this.enableEditing();
    }
  }

  /**
   * Add an annotation layer to the leaflet map.
   * leaflet map에 annotation layer 추가
   * @param {*} layer
   */
  addLayer(layer) {
    if (layer != 'undefined' && layer != null) {
      if (!this.annotationFeatures.hasLayer(layer)) {
        this.annotationFeatures.addLayer(layer);

        // Remove the edit styling for the markers. // 마커 편집 스타일 제거
        $(".leaflet-marker-icon").removeClass("leaflet-edit-marker-selected");
      }
    }
  }

  /**
   * Remove an annotation layer from the leaflet map.
   * leaflet map에서 annotation layer 제거
   * @param {*} layer
   */
  removeLayer(layer) {

    if (layer != 'undefined' && layer != null) {
      if (this.annotationFeatures.hasLayer(layer)) {
        this.annotationFeatures.removeLayer(layer);
      }
    }

  }

  /**
   * Delete an annotation, removing the annotation layers from the map.
   * annotation 삭제, 지도에서 annotation layer 제거
   * @param {*} annotation_id
   */
  handleAnnotationDelete(annotation_id) {

    // Need to check if we are annotating this instance
    // 인스턴스에 annotation 달고 있는지 확인 필요
    if (this.state.annotating) {
      if (this.current_annotationIndex == annotation_id) {
        // Clear the annotation keypoint queue // annotation keypoint 순서 지우기
        this.annotation_keypoint_queue = [];

        if (this.annotating_keypoint) {
          this.cancelKeypointAnnotation();
        }
        else if (this.annotating_bbox) {
          this.cancelBBoxAnnotation();
        }
      }
    }

    let annotation = this.state.annotations[annotation_id];
    let annotation_layer = this.annotation_layers[annotation_id];

    // Remove the bbox. // bbox 제거
    if (annotation_layer.bbox != 'undefined' && annotation_layer.bbox != null) {
      let layer = annotation_layer.bbox;
      this.removeLayer(layer);
    }

    // Remove the keypoints. // keypoint 제거
    if (annotation_layer.keypoints != 'undefined' && annotation_layer.keypoints != null) {
      for (var i = 0; i < annotation_layer.keypoints.length; i++) {
        let layer = annotation_layer.keypoints[i];
        this.removeLayer(layer);
      }
    }

    this.setState(function (prevState, props) {

      let annotations = prevState.annotations;
      // Mark the annotation as deleted. The server will delete it from the database
      // annotation 삭제된 것으로 표시합니다. 서버가 데이터베이스에서 삭제
      annotations[annotation_id].deleted = true;

      return {
        'annotations': annotations
      };

    });

  }

  /**
   * Restrict the box to the image bounds.
   * box를 이미지 경계로 설정
   * @param {*} layer
   */
  restrictBoxLayerToImage(layer) {
    var bounds = layer.getBounds();
    var point1 = this.leafletMap.project(bounds.getNorthWest(), 0);
    var point2 = this.leafletMap.project(bounds.getSouthEast(), 0);

    var x1 = point1.x;
    var y1 = point1.y;
    var x2 = point2.x;
    var y2 = point2.y;

    [x1, y1] = this._restrictPointToImageBounds(x1, y1);
    [x2, y2] = this._restrictPointToImageBounds(x2, y2);

    // Is one of the deminsions 0?
    // deminions 중 하나가 0인지?
    var valid = true;
    if (x2 - x1 <= 0) {
      return null;
    }
    else if (y2 - y1 <= 0) {
      return null;
    }

    point1 = L.point(x1, y1);
    point1 = this.leafletMap.unproject(point1, 0);
    point2 = L.point(x2, y2);
    point2 = this.leafletMap.unproject(point2, 0);

    bounds = [point1, point2];
    return L.rectangle(bounds, layer.options);
  }

  /**
   * Extract a bbox annotation from a bbox layer
   * bbox layer에서 bbox annotation 추출
   * @param {*} layer
   */
  extractBBox(layer) {

    let bounds = layer.getBounds();
    let point1 = this.leafletMap.project(bounds.getNorthWest(), 0);
    let point2 = this.leafletMap.project(bounds.getSouthEast(), 0);

    var x1 = point1.x;
    var y1 = point1.y;
    var x2 = point2.x;
    var y2 = point2.y;

    [x1, y1] = this._restrictPointToImageBounds(x1, y1);
    [x2, y2] = this._restrictPointToImageBounds(x2, y2);

    let x = x1 / this.imageWidth;
    let y = y1 / this.imageHeight;
    let w = (x2 - x1) / this.imageWidth;
    let h = (y2 - y1) / this.imageHeight;

    return [x, y, w, h];

  }

  /**
   * Translate the point (if needed) so that it lies within the image bounds
   * 이미지 경계 내에 놓이도록 포인트를 변환합니다(필요한 경우).
   * @param  {[type]} x [description]
   * @param  {[type]} y [description]
   * @return {[type]}   [description]
   */
  _restrictPointToImageBounds(x, y) {

    if (x > this.imageWidth) {
      x = this.imageWidth;
    }
    else if (x < 0) {
      x = 0;
    }
    if (y > this.imageHeight) {
      y = this.imageHeight;
    }
    else if (y < 0) {
      y = 0;
    }

    return [x, y];

  }


  getAnnotations() {

    let annotations = this.state.annotations;
    var annotations_to_save = [];
    let annotation_layers = this.annotation_layers;

    for (var i = 0; i < annotations.length; i++) {

      let annotation = annotations[i];

      // Ignore deleted annotations // 삭제된 annotations 무시
      if (annotation.deleted) {
        continue;
      }

      var new_annotation = $.extend(true, {}, annotation);
      let annotation_layer = annotation_layers[i];

      var new_bbox;

      if (annotation_layer['bbox'] != 'undefined' && annotation_layer['bbox'] != null) {
        let layer = annotation_layer['bbox'];
        new_bbox = this.extractBBox(layer);
      }

      if (new_bbox != 'undefined') {
        new_annotation['bbox'] = new_bbox;
      }

      annotations_to_save.push(new_annotation);
    }

    return annotations_to_save;
  }

  getState() {
    let state = {
      'annotations': this.getAnnotations(),
      'image': this.props.image
    }
    return state;
  }

  /**
   * Extract the current state of the annotations and send them to our parent view.
   * The current positions of the bboxes and keypoints are extracted from their
   * corresponding layer.
   * annotation의 현재 상태를 추출하여 상위 뷰로 보냅니다.
    * bboxes 및 keypoints의 현재 위치는 해당 위치에서 추출됩니다.
    * 해당 레이어.
    */
  // NOTE: need to remove this // 참고: 이것을 제거해야함
  handleSave() {

    //let annotations_to_save = this.getAnnotations()
    //this.props.onSave(annotations_to_save);

  }

  /**
   * Focus on a particular instance by zooming in on it.
   * 확대하여 특정 인스턴스에 초점을 맞춥니다.
   * @param {*} annotationIndex
   */
  handleAnnotationFocus(annotationIndex) {


    let annotation = this.state.annotations[annotationIndex];
    let annotation_layer = this.annotation_layers[annotationIndex];

    // lets show the annotations if they are not shown
    // annotations이 표시되지 않으면 annotations을 표시할 수 있다.
    this.showAnnotation(annotation, annotation_layer);

    if (annotation_layer['bbox'] != 'undefined' && annotation_layer['bbox'] != null) {
      let layer = annotation_layer['bbox'];
      let bounds = layer.getBounds();
      this.leafletMap.fitBounds(bounds);
    }

  }

  /**
   * Hide this annotation.
   * annotation 숨기기
   * @param {*} annotation
   * @param {*} annotation_layer
   */
  hideAnnotation(annotation, annotation_layer) {
    if (annotation_layer['bbox'] != 'undefined' && annotation_layer['bbox'] != null) {
      let layer = annotation_layer['bbox'];
      this.removeLayer(layer);
    }
    if (annotation_layer['keypoints'] != 'undefined' && annotation_layer['keypoints'] != null) {
      let keypoints = annotation.keypoints
      let keypoint_layers = annotation_layer['keypoints'];
      let category = this.categoryMap[annotation['category_id']];
      for (var j = 0; j < category.keypoints.length; j++) {
        let index = j * 3;
        let visibility = keypoints[index + 2];

        if (visibility > 0) {
          let layer = keypoint_layers[j];
          this.removeLayer(layer);
        }
      }
    }
  }

  /**
   * Hide all other annotations.
   * 다른 모든 주석을 숨깁니다.
   * @param {*} annotationIndex
   */
  hideOtherAnnotations(annotationIndex) {

    for (var i = 0; i < this.state.annotations.length; i++) {

      let annotation = this.state.annotations[i];
      if (annotation.deleted != 'undefined' && annotation.deleted) {
        continue;
      }

      let annotation_layer = this.annotation_layers[i];

      if (i == annotationIndex) {
        // make sure this annotation is shown
        // 이 주석이 표시되는지 확인하십시오
        this.showAnnotation(annotation, annotation_layer);
      }
      else {
        // Hide the other annotations
        // 다른 모든 annotations 숨기기
        this.hideAnnotation(annotation, annotation_layer);
      }
    }

  }

  /**
   * Hide all of the annotations.
   * 모든 주석을 숨깁니다.
   */
  hideAllAnnotations() {

    for (var i = 0; i < this.state.annotations.length; i++) {

      let annotation = this.state.annotations[i];
      if (annotation.deleted != 'undefined' && annotation.deleted) {
        continue;
      }

      let annotation_layer = this.annotation_layers[i];

      this.hideAnnotation(annotation, annotation_layer);

    }

    // Rerender // 다시 렌더링
    this.setState(this.state);

  }

  /**
   * Show this annotation.
   * 이 annotation 표출
   * @param {*} annotation
   * @param {*} annotation_layer
   */
  showAnnotation(annotation, annotation_layer) {

    if (annotation_layer['bbox'] != 'undefined' && annotation_layer['bbox'] != null) {
      let layer = annotation_layer['bbox'];
      this.addLayer(layer);
    }
    if (annotation_layer['keypoints'] != 'undefined' && annotation_layer['keypoints'] != null) {
      let keypoints = annotation.keypoints;
      let keypoint_layers = annotation_layer['keypoints'];
      let category = this.categoryMap[annotation['category_id']];
      for (var j = 0; j < category.keypoints.length; j++) {
        let index = j * 3;
        let visibility = keypoints[index + 2];

        if (visibility > 0) {
          let layer = keypoint_layers[j];
          this.addLayer(layer);
        }
      }
    }

  }

  /**
   * Show all annotations.
   * 모든 annotations 표출
   */
  showAllAnnotations() {

    for (var i = 0; i < this.state.annotations.length; i++) {

      let annotation = this.state.annotations[i];
      if (annotation.deleted != 'undefined' && annotation.deleted) {
        continue;
      }

      let annotation_layer = this.annotation_layers[i];

      this.showAnnotation(annotation, annotation_layer);

    }

    // Rerender // 다시 렌더링
    this.setState(this.state);

  }

  render() {

    let image_id = this.props.image.id;
    let rights_holder = this.props.image.rights_holder;

    // Decide whether the "new box" button should be "cancel box" or not
    // "새 상자" 버튼을 "상자 취소"로 할지 여부를 결정합니다.
    var newBoxEl;
    if (this.state.annotating) {
      newBoxEl = <button type="button" className="btn btn-outline-primary" onClick={this.cancelBBoxAnnotation}>Cancel New Box</button>;
    }
    else {
      newBoxEl = <button type="button" className="btn btn-outline-primary" onClick={this.createNewInstance}>New Box</button>;
    }


    // Create the instructions element
    // 지침 요소 생성
    var instructionsEl = "";
    if (this.state.annotating) {
      instructionsEl = (
        <div className="alert alert-success">
          <h4>Click and drag a box on the image.</h4>
        </div>
      );
    }
    else if (this.props.enableEditing) {

      // Get the number of annotations (don't count deleted annotations)
      // annotations 수 가져오기(삭제된 annotations은 계산하지 않음)
      var num_annotations = 0;
      for (var i = 0; i < this.state.annotations.length; ++i) {
        if (this.state.annotations[i].deleted == undefined || this.state.annotations[i].deleted == false) {
          num_annotations += 1;
          break;
        }
      }
      if (num_annotations > 0) {
        instructionsEl = (
          <div className="alert alert-info">
            <h4>Edit boxes.</h4>
          </div>
        );
      }
      else {
        instructionsEl = (
          <div className="alert alert-info">
            <h4>Click 'New Box' to draw a box.</h4>
          </div>
        );
      }
    }
    else {
      instructionsEl = (
        <div className="alert alert-warning">
          <h4>View mode only.</h4>
        </div>
      );
    }
    // var instructionsEl;
    // if (this.state.annotating){
    //   if (this.annotating_keypoint){

    //     let category = this.categoryMap[this.state.annotations[this.current_annotationIndex].category_id];
    //     let keypoint_name = category.keypoints[this.current_keypointIndex];
    //     instructionsEl = (<KeypointInstructions name={keypoint_name} />);

    //   }
    //   else if(this.annotating_bbox){
    //     let category = this.categoryMap[this.new_category_id];
    //     let name = category.name;
    //     instructionsEl = (<BBoxInstructions name={name} />);
    //   }
    // }
    // else{
    //   instructionsEl = (<DefaultEditInstructions />)
    // }

    // Build up the annotation side bar
    // annotation 사이드바 구축
    var annotation_els = [];
    for (var i = 0; i < this.state.annotations.length; i++) {

      let annotation = this.state.annotations[i];

      // Has this annotation been deleted?
      // 이 annotation이 삭제되었는지?
      if (annotation.deleted != 'undefined' && annotation.deleted) {
        continue;
      }

      // Is this annotation currently hidden?
      // 이 annotation이 현재 숨겨져 있는지?
      var hidden = false;
      if (this.annotationFeatures != null) { // It could be the case that we haven't rendered the map yet.
        hidden = !this.annotationFeatures.hasLayer(this.annotation_layers[i]['bbox']);
      }
      let category = this.categoryMap[annotation.category_id];

      annotation_els.push((
        <BBoxInstance key={i.toString()}
          id={i}
          category={category}
          keypoints={annotation.keypoints}
          handleKeypointVisibilityChange={this.handleKeypointVisibilityChange}
          handleDelete={this.handleAnnotationDelete}
          handleFocus={this.handleAnnotationFocus}
          handleAnnotateKeypoints={this.handleAnnotateKeypoints}
          handleHideOthers={this.hideOtherAnnotations}
          hidden={hidden} />
      ));
    }

    return (
      <div>
        <div className="row">
          <div className="col-8">
            <div className="row">
              <div className="col">
                <div ref={e => { this.leafletHolderEl = e; }} className='leaflet-image-holder' ></div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <span> Image ID: {image_id}</span>
              </div>
              <div className="col">
                <span> Rights holder: {rights_holder}</span>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col">
                {instructionsEl}
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div className="d-flex justify-content-between">
                  <div className="p-2">
                    {newBoxEl}
                  </div>
                  <div className="p-2">
                    <div className="btn-group" role="group">
                      /* 숨기기 버튼 생성 */
                      <button type="button" className="btn btn-outline-secondary" onClick={this.hideAllAnnotations}>Hide All</button>
                      /* 표출 버튼 생성 */
                      <button type="button" className="btn btn-outline-secondary" onClick={this.showAllAnnotations}>Show All</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div id="annotationAccordion" role="tablist" aria-multiselectable="true">
                  {annotation_els}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}