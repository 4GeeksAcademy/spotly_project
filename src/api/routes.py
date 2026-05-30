from flask import request, jsonify, Blueprint
from api.models import db, User, Spot, SpotImage, Category, Like, Favorite
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

import os
import cloudinary
import cloudinary.uploader

api = Blueprint('api', __name__)


@api.route('/upload', methods=['POST'])
def upload_image():
    file = request.files["image"]
    if not file:
        return jsonify({"error": "the file is required"}), 400

    result = cloudinary.uploader.upload(file)
    if 'secure_url' not in result:
        return jsonify({"error": "the image can not be uploaded"}), 400

    return jsonify(result["secure_url"]), 200


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


cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)


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
            "apellido": user.apellido,      # ← agregar
            "email": user.email,
            "tipo_usuario": user.tipo_usuario  # ← agregar
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

# ── CREAR SPOT ──────────────────────────────────────────


@api.route('/spots', methods=['POST'])
@jwt_required()
def create_spot():
    user_id = get_jwt_identity()
    body = request.get_json()

    titulo = body.get("titulo")
    descripcion = body.get("descripcion", "")
    latitude = body.get("latitude")
    longitude = body.get("longitude")
    images = body.get("images", [])

    if not titulo:
        return jsonify({"msg": "El título es obligatorio"}), 400

    # Buscar o crear categoría "General" automáticamente
    category = Category.query.filter_by(nombre="General").first()
    if not category:
        category = Category(nombre="General")
        db.session.add(category)
        db.session.flush()  # obtener el id sin hacer commit aún

    location_str = f"{latitude},{longitude}" if latitude and longitude else None

    new_spot = Spot(
        user_id=int(user_id),
        category_id=category.id,
        titulo=titulo,
        descripcion=descripcion,
        location=location_str,
    )
    db.session.add(new_spot)
    db.session.flush()

    for url in images:
        db.session.add(SpotImage(spot_id=new_spot.id, image_url=url))

    db.session.commit()

    return jsonify({
        "msg": "Spot creado",
        "spot": _serialize_spot(new_spot, user_id)
    }), 201


# ── LISTAR SPOTS (feed) ──────────────────────────────────
@api.route('/spots', methods=['GET'])
@jwt_required()
def get_spots():
    current_user_id = get_jwt_identity()

    spots = Spot.query.order_by(Spot.created_at.desc()).all()

    return jsonify([
        _serialize_spot(s, current_user_id)
        for s in spots
    ]), 200

@api.route('/spots/<int:spot_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(spot_id):
    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({
            "msg": "Spot no encontrado"
        }), 404

    existing_like = Like.query.filter_by(
        user_id=current_user_id,
        spot_id=spot_id
    ).first()

    if existing_like:
        db.session.delete(existing_like)
        liked = False
    else:
        new_like = Like(
            user_id=current_user_id,
            spot_id=spot_id
        )
        db.session.add(new_like)
        liked = True

    db.session.commit()

    likes_count = Like.query.filter_by(spot_id=spot_id).count()

    return jsonify({
        "liked": liked,
        "likes": likes_count
    }), 200

@api.route('/spots/<int:spot_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(spot_id):
    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({
            "msg": "Spot no encontrado"
        }), 404

    existing_favorite = Favorite.query.filter_by(
        user_id=current_user_id,
        spot_id=spot_id
    ).first()

    if existing_favorite:
        db.session.delete(existing_favorite)
        saved = False
    else:
        new_favorite = Favorite(
            user_id=current_user_id,
            spot_id=spot_id
        )
        db.session.add(new_favorite)
        saved = True

    db.session.commit()

    favorites_count = Favorite.query.filter_by(
        spot_id=spot_id
    ).count()

    return jsonify({
        "saved": saved,
        "favorites": favorites_count
    }), 200

# ── helper de serialización ──────────────────────────────
def _serialize_spot(spot, current_user_id=None):
    lat, lng = None, None

    if spot.location:
        try:
            lat, lng = spot.location.split(",")
            lat = float(lat)
            lng = float(lng)
        except:
            pass

    likes_count = Like.query.filter_by(spot_id=spot.id).count()

    liked = False
    if current_user_id:
        liked = Like.query.filter_by(
            spot_id=spot.id,
            user_id=int(current_user_id)
        ).first() is not None

    favorites_count = Favorite.query.filter_by(spot_id=spot.id).count()

    saved = False
    if current_user_id:
        saved = Favorite.query.filter_by(
        spot_id=spot.id,
        user_id=int(current_user_id)
    ).first() is not None

    return {
        "id": spot.id,
        "titulo": spot.titulo,
        "descripcion": spot.descripcion,
        "location": spot.location,
        "latitude": lat,
        "longitude": lng,
        "created_at": spot.created_at.isoformat() if spot.created_at else None,
        "likes": likes_count,
        "liked": liked,
        "favorites": favorites_count,
        "saved": saved,
        "user": {
            "id": spot.user.id,
            "nombre": spot.user.nombre,
            "apellido": spot.user.apellido,
            "tipo_usuario": spot.user.tipo_usuario,
        },
        "images": [img.image_url for img in spot.images],
    }
# ── LISTAR USUARIOS ──────────────────────────────────────


@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())
    users = User.query.filter(User.id != current_user_id).all()
    return jsonify([{
        "id": u.id,
        "nombre": u.nombre,
        "apellido": u.apellido,
    } for u in users]), 200


# ── ELIMINAR SPOT ───────────────────────────────────────
@api.route('/spots/<int:spot_id>', methods=['DELETE'])
@jwt_required()
def delete_spot(spot_id):

    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({
            "msg": "Spot no encontrado"
        }), 404

    current_user = User.query.get(current_user_id)

    # Solo dueño o admin pueden eliminar
    if (
        spot.user_id != current_user_id and
        current_user.tipo_usuario != "admin"
    ):
        return jsonify({
            "msg": "No autorizado"
        }), 403

    # eliminar imágenes primero
    SpotImage.query.filter_by(spot_id=spot.id).delete()

    db.session.delete(spot)
    db.session.commit()

    return jsonify({
        "msg": "Spot eliminado correctamente"
    }), 200
