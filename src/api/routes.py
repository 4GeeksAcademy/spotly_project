from flask import request, jsonify, Blueprint
from api.models import db, User
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

api = Blueprint('api', __name__)


@api.route('/register', methods=['POST'])
def register():

    body = request.get_json()

    email = body.get("email")
    password = body.get("password")
    nombre = body.get("nombre")

    if not email or not password or not nombre:
        return jsonify({
            "msg": "Faltan datos"
        }), 400

    user_exists = User.query.filter_by(email=email).first()

    if user_exists:
        return jsonify({
            "msg": "El usuario ya existe"
        }), 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        nombre=nombre,
        apellido="",
        email=email,
        password_hash=hashed_password,
        telefono="",
        pais="",
        genero=""
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "msg": "Usuario creado correctamente"
    }), 201


@api.route('/login', methods=['POST'])
def login():

    body = request.get_json()

    email = body.get("email")
    password = body.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "msg": "Usuario no encontrado"
        }), 404

    password_correct = check_password_hash(
        user.password_hash,
        password
    )

    if not password_correct:
        return jsonify({
            "msg": "Contraseña incorrecta"
        }), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email
        }
    }), 200


@api.route('/profile', methods=['GET'])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    return jsonify({
        "id": user.id,
        "nombre": user.nombre,
        "email": user.email
    }), 200