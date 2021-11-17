from flask import Flask, flash, redirect, render_template, request, url_for, send_from_directory, session
from werkzeug.utils import secure_filename
import os


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # app.config['UPLOAD_FOLDER'] = 'FLASKR\templates\media'
    app.config.from_mapping(
        debug=True,
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
        
    )

    if test_config is None:
        # Load the instance config, if exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # @app.route('/upload')
    # def upload_file():
    #     return render_template('upload.html')


    # # @app.route('/create', methods=['GET', 'POST'])
    # def uploader_file():
    #     methods=['GET', 'POST']
    #     if request.method == 'POST':
    #         file = request.files['file']
    #         file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    #         # return render_template('blog/create.html')
    #         return redirect(url_for('create'))
    #         # return 'file uploaded successfully'



    # a simple page that says hello / test
    @app.route('/hello')
    def hello():
        return 'Hello, world!'

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import blog
    app.register_blueprint(blog.bp)
    app.add_url_rule('/', endpoint='index')


    return app
