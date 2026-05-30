import os
from flask import Flask, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from datetime import timedelta


ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"

app = Flask(__name__)
app.url_map.strict_slashes = False

app.config["JWT_SECRET_KEY"] = "spotly-super-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

db_url = os.getenv("DATABASE_URL")

if db_url is not None:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace(
        "postgres://",
        "postgresql://"
    )
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/test.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

MIGRATE = Migrate(app, db)

db.init_app(app)

JWTManager(app)

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(api, url_prefix='/api')


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return error.to_dict(), error.status_code


@app.route('/')
def sitemap():
    return generate_sitemap(app)


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    root_dir = os.path.join(os.path.dirname(__file__), '../public/')
    return send_from_directory(root_dir, path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=True)
