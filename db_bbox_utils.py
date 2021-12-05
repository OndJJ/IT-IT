"""
Utilities for populating the dataset for bounding box collection.

You will need to insert an image and category collection into the database.

The instructions dict consists of:

bounding box 컬렉션 데이터 세트를 채우기 위한 유틸리티

데이터베이스에 이미지와 카테고리 컬렉션을 삽입합니다.

dict는 다음으로 구성

{
  id : str
  title : str
  description : str
  instructions: url
  examples: [url]
}
Where instructions is a url to a website (like a Google Slides presentation) where you have more info about the task.
`examples` is a list of image urls that will be rendered on the start screen. The height for these images should
be 500px.

지침은 작업에 대한 추가 정보가 있는 웹사이트(예: Google 프레젠테이션 프레젠테이션)의 URL입니다.
'examples'는 시작 화면에 렌더링될 이미지 URL 목록입니다. 이 이미지의 높이는 500픽셀이어야 합니다.


A bounding box task dict consists of:
{
  id : str
  image_ids : [str]
  instructions_id : str,
  category_id : str
}
Where image ids point to normal image objects.

The result of a worker completing the task is:

이미지 ID는 일반 이미지 개체를 말함
작업자가 작업을 완료한 결과는 아래와 같다.
{
  time : float
  task_id : str
  date : str
  worker_id : str
  results : [bbox_result]
}
Where bbox_result looks like:
{
  time : float
  annotations : [annotation]
  image : image
}
Where `image` and `annotation` are the standard image and annotation objects.
"""
# bounding box 설정 py 

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse
import json
import random
import uuid

from annotation_tools.annotation_tools import get_db

# db  - bbox_task, bbox_task_instructions, bbox_task_result 제거


def drop_bbox_collections(db):
    db.drop_collection('bbox_task')
    db.drop_collection('bbox_task_instructions')
    db.drop_collection('bbox_task_result')


def ensure_bbox_indices(db):
    db.bbox_task.create_index("id", unique=True)
    db.bbox_task_instructions.create_index("id", unique=True)

# db - bbox_tasks 삽입


def insert_bbox_tasks(db, tasks):
    """
    Args:
      db: a pymongo database connection
      tasks: [{
        id : task_id,
        image_ids : [image_ids],
        instructions_id : instructions_id,
        category_id : str
      }] A list of bbox task dicts.
    """
    try:
        response = db.bbox_task.insert_many(tasks, ordered=False)
    except:
        pass
    return response

# db - bbox_task_instructions 삽입


def insert_bbox_task_instructions(db, task_instructions):
    """ Store the instructions for the bbox task.
    Args:
      task_instructions: [{
        'id' :
        'title' :
        'description' :
        'instructions':
        'examples'
      }] A list of bbox task instructions
    """
    try:
        response = db.bbox_task_instructions.insert_many(
            task_instructions, ordered=False)
    except:
        pass
    return response

# db를 통해 전체 이미지에 bounding box 삽입합니다. 편의 기능


def create_bbox_tasks_for_all_images(db, category_id, instructions_id, num_images_per_task=20):
    """Insert all images into a bounding box task. This is a convenience function.
    Returns:
      [<bbox task dict>] a list of the tasks created. # 작업 목록 생성
    """

    ensure_bbox_indices(db)

    images = list(db.image.find({}, {'id': True}))
    image_ids = [image['id'] for image in images]
    random.shuffle(image_ids)

    image_id_groups = [image_ids[idx:idx+num_images_per_task]
                       for idx in range(0, len(image_ids), num_images_per_task)]

    bbox_tasks = []
    for group in image_id_groups:
        task_id = str(uuid.uuid1())
        bbox_tasks.append({
            'id': task_id,
            'image_ids': group,
            'instructions_id': instructions_id,
            'category_id': category_id
        })

    insert_bbox_tasks(db, bbox_tasks)

    return bbox_tasks

# 작업 불러오기


def load_tasks(db, task_data):
    """
    task_data{
      'tasks' : [bbox_task],
      'instructions' : [bbox_task_instructions]
    }
    """
    assert 'tasks' in task_data,  "Failed to find `tasks` in task_data object."

    if 'instructions' in task_data:
        instructions = task_data['instructions']
        print("Inserting %d instructions." % (len(instructions),))
        response = insert_bbox_task_instructions(db, instructions)
        print("Successfully inserted %d instuctions." %
              (len(response.inserted_ids),))

    tasks = task_data['tasks']
    print("Inserting %d tasks." % (len(tasks),))
    response = insert_bbox_tasks(db, tasks)
    print("Successfully inserted %d tasks." % (len(response.inserted_ids),))

# 작업 결과 출력


def export_task_results(db, task_data=None, denormalize=False):
    """ Export the bbox task results. Saves a list of task results to `output_path`.
    Args:
      task_data: Use this to specify which task results to export.
      denormalize: Should the annotations be stored in image coordinates?
    """
    if task_data != None:
        assert 'tasks' in task_data,  "Failed to find `tasks` in task_data object."
        task_ids = list(set([task['id'] for task in task_data['tasks']]))
        task_results = list(db.bbox_task_result.find(
            {'task_id': {"$in": task_ids}}, projection={'_id': False}))
    else:
        task_results = list(db.bbox_task_result.find(
            projection={'_id': False}))

    if denormalize:
        for task_result in task_results:
            for image_result in task_result['results']:
                image = image_result['image']
                width = image['width']
                height = image['height']
                for anno in image_result['annotations']:
                    x, y, w, h = anno['bbox']
                    anno['bbox'] = [x * width, y *
                                    height, w * width, h * height]

    return task_results

# argparse.ArgumentParser == 호출 시 인자 값 전달 == 동작을 다르게 구현 할 때 사용
def parse_args():

    parser = argparse.ArgumentParser(
        description='Dataset loading and exporting utilities.')


# 수행 작업
    parser.add_argument('-a', '--action', choices=['drop', 'load', 'export'], dest='action',
                        help='The action you would like to perform.', required=True)

# bbox 작업 및 (선택 사항) 설명이 포함된 json 작업 파일의 경로입니다 / load, 출력시 수행 됨
    parser.add_argument('-t', '--tasks', dest='task_path',
                        help='Path to a json task file containing bbox tasks and (optionally) instructions. Used with the `load` and `export` action.', type=str,
                        required=False, default=None)

# 데이터베이스를 출력할 때 주석을 비활성화 'export' 작업시 사용
    parser.add_argument('-u', '--denormalize', dest='denormalize',
                        help='Denormalize the annotations when exporting the database. Used with the `export` action.',
                        required=False, action='store_true', default=False)

# json 데이터 경로 저장 / export 작업에 수행 됨
    parser.add_argument('-o', '--output', dest='output_path',
                        help='Save path for the json dataset. Used with the `export` action.', type=str,
                        required=False)

    args = parser.parse_args()  # 함수 call
    return args


def main():
    args = parse_args()
    db = get_db()

    action = args.action
    if action == 'drop':
        drop_bbox_collections(db)
    elif action == 'load':
        with open(args.task_path) as f:
            task_data = json.load(f)
        ensure_bbox_indices(db)
        load_tasks(db, task_data)
    elif action == 'export':
        if args.task_path != None:
            with open(args.task_path) as f:
                task_data = json.load(f)
        else:
            task_data = None
        results = export_task_results(
            db, task_data, denormalize=args.denormalize)
        with open(args.output_path, 'w') as f:
            json.dump(results, f)


if __name__ == '__main__':

    main()


