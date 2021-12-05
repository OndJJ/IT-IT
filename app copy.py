"""
Flask web server.
"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from werkzeug.utils import secure_filename

import datetime
import json
import os
import random
import cv2

from flask import Flask, render_template, jsonify, request,Response
# from bson import json_util    # MongoDB 에서 사용 Json 문자를 바이너리 형태로 인코딩한 바이트 문자열로 전환 시켜줌
# from annotation_tools import default_config as cfg # 환경 설정 부분, 필요하면 사용

# dirname : 경로명 path의 디렉터리 이름을 반환합니다. path를 함수 split()에 전달하여 반환된 쌍의 첫 번째 요소입니다.
# abspath : 경로명 path의 정규화된 절대 버전을 반환합니다. normpath() 함수를 호출하는 것과 동등
current_folder = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)

def get_img(img_path):

    img = cv2.imread(img_path, 1)

    _, jpeg = cv2.imencode('.jpg', img) # 이미지 인코딩(압축), 출력 파일 확장자(.jpg), 압축 할 이미지(img)
    jpeg = jpeg.tobytes()
        
    yield (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + jpeg + b'\r\n\r\n')
    # return은 반환 즉시 함수가 끝나지만 
    # yield는 잠시 함수 바깥의 코드가 실행되도록 양보하여 값을 가져가게 한 뒤 다시 제너레이터 안의 코드를 계속 실행하는 방식입니다. 


@app.route('/img_test')
def index():

    return render_template('img_test.html')

@app.route('/img_show')
def img_show():
    img_path = 'auto_lb/media/.jpg'
    return Response(get_img(img_path), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/upload')
def upload_file():
  return render_template('upload.html')

@app.route('/uploader', methods=['GET','POST'])
def uploader_file():
  if request.method == 'POST':
    file = request.files['file']
    filename = secure_filename(file.filename)
    file.save(os.path.join('auto_lb/media', file.filename))
    return 'file uploaded successfully'

# def main():
    
#     app.run(host='0.0.0.0',port=16003)

# if __name__ == "__main__":
#     main()

# app = Flask(__name__)

# 환경 설정 부분, 필요하면 다른 방법을 찾아서 바꿔보자
if 'VAT_CONFIG' in os.environ:
  app.config.from_envvar('VAT_CONFIG')


@app.route('/')
def home():
  return render_template('layout.html')


# bounding box 작업 이미지 목록을 가져오고 사용자에게 반환
@app.route('/bbox_task/<task_id>')
def bbox_task(task_id):
  """ Get the list of images for a bounding box task and return them along
  with the instructions for the task to the user.
  """

  bbox_task = mongo.db.bbox_task.find_one_or_404({'id' : task_id})
  task_id = str(bbox_task['id'])
  tasks = []
  for image_id in bbox_task['image_ids']:
    image = mongo.db.image.find_one_or_404({'id' : image_id}, projection={'_id' : False})
    tasks.append({
      'image' : image,
      'annotations' : []
    })

  category_id = bbox_task['category_id']
  categories = [mongo.db.category.find_one_or_404({'id' : category_id}, projection={'_id' : False})]
  #categories = json.loads(json_util.dumps(categories))

  task_instructions_id = bbox_task['instructions_id']
  task_instructions = mongo.db.bbox_task_instructions.find_one_or_404({'id' : task_instructions_id}, projection={'_id' : False})

  return render_template('bbox_task.html',
    task_id=task_id,
    task_data=tasks,
    categories=categories,
    mturk=True,
    task_instructions=task_instructions
  )

# bonunding box 결과 저장
@app.route('/bbox_task/save', methods=['POST'])
def bbox_task_save():
  """ Save the results of a bounding box task.
  """

  task_result = json_util.loads(json.dumps(request.json))

  task_result['date'] = str(datetime.datetime.now())

  insert_res = mongo.db.bbox_task_result.insert_one(task_result, bypass_document_validation=True)

  return ""


# 이미지 작성 페이지 
@app.route('/edit_image/<image_id>')
def edit_image(image_id):
  """ Edit a single image.
  """

  image = mongo.db.image.find_one_or_404({'id' : image_id})
  annotations = list(mongo.db.annotation.find({'image_id' : image_id}))
  categories = list(mongo.db.category.find())

# Python 객체-> JSON 문자열로 변환하기 위해 dumps() 함수를 사용
  image = json_util.dumps(image)
  annotations = json_util.dumps(annotations)
  categories = json_util.dumps(categories)

  if request.is_xhr:
    # Return just the data
    return jsonify({
      'image' : json.loads(image),
      'annotations' : json.loads(annotations),
      'categories' : json.loads(categories)
    })
  else:
    # Render a webpage to edit the annotations for this image
    # 주석이 작성된 이미지를 웹으로 전달 
    return render_template('edit_image.html', image=image, annotations=annotations, categories=categories)


# 여러 이미지 작성
@app.route('/edit_task/')
def edit_task():
  """ Edit a group of images.
  """

  if 'image_ids' in request.args:

    image_ids = request.args['image_ids'].split(',')

  else:

    start=0
    if 'start' in request.args:
      start = int(request.args['start'])
    end=None
    if 'end' in request.args:
      end = int(request.args['end'])

    # Find annotations and their accompanying images for this category
    # 카테고리 안에서 이미지에 맞는 주석 찾기
    if 'category_id' in request.args:
      category_id = request.args['category_id']
      annos = mongo.db.annotation.find({ "category_id" : category_id}, projection={'image_id' : True, '_id' : False})#.sort([('image_id', 1)])
      image_ids = list(set([anno['image_id'] for anno in annos]))
      image_ids.sort()

    # Else just grab all of the images.
    # 없다면 카테고리 밖에서 이미지 찾기
    else:
      images = mongo.db.image.find(projection={'id' : True, '_id' : False}).sort([('id', 1)])
      image_ids = [image['id'] for image in images]

    if end is None:
      image_ids = image_ids[start:]
    else:
      image_ids = image_ids[start:end]

    if 'randomize' in request.args:
      if request.args['randomize'] >= 1:
        random.shuffle(image_ids)

  categories = list(mongo.db.category.find(projection={'_id' : False}))

  return render_template('edit_task.html',
    task_id=1,
    image_ids=image_ids,
    categories=categories,
  )


# annotations overwrite/저장 페이지
@app.route('/annotations/save', methods=['POST'])
def save_annotations():
  """ Save the annotations. This will overwrite annotations.
  """
  annotations = json_util.loads(json.dumps(request.json['annotations']))

  for annotation in annotations:
    # Is this an existing annotation?
    # 기존에 있던 주석 제거
    if '_id' in annotation:
      if 'deleted' in annotation and annotation['deleted']:
        mongo.db.annotation.delete_one({'_id' : annotation['_id']})
      else:
        result = mongo.db.annotation.replace_one({'_id' : annotation['_id']}, annotation)
    else:
      if 'deleted' in annotation and annotation['deleted']:
        pass # this annotation was created and then deleted.
      else:
        # This is a new annotation / 주석 생성
        # The client should have created an id for this new annotation / 주석을 생성하면 client는 주석에대한 새 ID가 필요
        # Upsert the new annotation so that we create it if its new, or replace it if (e.g) the
        # user hit the save button twice, so the _id field was never seen by the client.
        # 새로운 주석인 경우 생성하도록 새 주석을 Upsert하거나 (예:) 다음과 같은 경우 교체합니다.
        # 사용자가 저장 버튼을 두 번 눌렀으므로 _id 필드가 클라이언트에 표시되지 않습니다.
        assert 'id' in annotation
        mongo.db.annotation.replace_one({'id' : annotation['id']}, annotation, upsert=True)

        # if 'id' not in annotation:
        #   insert_res = mongo.db.annotation.insert_one(annotation, bypass_document_validation=True)
        #   anno_id =  insert_res.inserted_id
        #   mongo.db.annotation.update_one({'_id' : anno_id}, {'$set' : {'id' : str(anno_id)}})
        # else:
        #   insert_res = mongo.db.insert_one(annotation)

  return ""


if __name__ == '__main__':
    app.run(debug = True)