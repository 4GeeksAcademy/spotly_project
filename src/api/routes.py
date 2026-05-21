"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

bcrypt = Bcrypt()


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/register', methods=['POST'])
def register():

    body = request.get_json()

    nombre = body.get("nombre")
    apellido = body.get("apellido")
    email = body.get("email")
    password = body.get("password")

    if not nombre or not apellido or not email or not password:
        return jsonify({
            "msg": "Missing required fields"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "msg": "User already exists"
        }), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(
        nombre=nombre,
        apellido=apellido,
        email=email,
        password_hash=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "msg": "User created successfully"
    }), 201


@api.route('/login', methods=['POST'])
def login():

    body = request.get_json()

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({
            "msg": "Email and password required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "msg": "Invalid credentials"
        }), 401

    password_valid = bcrypt.check_password_hash(
        user.password_hash,
        password
    )

    if not password_valid:
        return jsonify({
            "msg": "Invalid credentials"
        }), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": access_token,
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "email": user.email
        }
    }), 200


@api.route('/private', methods=['GET'])
@jwt_required()
def private():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "msg": "User not found"
        }), 404

    return jsonify({
        "msg": "Private route working",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "email": user.email
        }
    }), 200