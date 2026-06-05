from flask import request, jsonify, Blueprint
from api.models import db, User, Spot, SpotImage, Category, Like, Comment, Favorite, Rating, View, Notification
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, Follow, User, Notification

import os
import cloudinary
import cloudinary.uploader

api = Blueprint("api", __name__)

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)


@api.route("/upload", methods=["POST"])
def upload_image():
    file = request.files.get("image")

    if not file:
        return jsonify({"error": "the file is required"}), 400

    result = cloudinary.uploader.upload(file)

    if "secure_url" not in result:
        return jsonify({"error": "the image can not be uploaded"}), 400

    return jsonify(result["secure_url"]), 200


@api.route("/register", methods=["POST"])
def register():
    body = request.get_json() or {}

    email = body.get("email")
    password = body.get("password")
    nombre = body.get("nombre")
    apellido = body.get("apellido", "")

    if not email or not password or not nombre:
        return jsonify({"msg": "Faltan datos"}), 400

    user_exists = User.query.filter_by(email=email).first()

    if user_exists:
        return jsonify({"msg": "El usuario ya existe"}), 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        nombre=nombre,
        apellido=apellido,
        email=email,
        password_hash=hashed_password,
        telefono="",
        pais="",
        genero=""
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado correctamente"}), 201


@api.route("/login", methods=["POST"])
def login():
    body = request.get_json() or {}

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña son obligatorios"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    password_correct = check_password_hash(user.password_hash, password)

    if not password_correct:
        return jsonify({"msg": "Contraseña incorrecta"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "email": user.email,
            "tipo_usuario": user.tipo_usuario,
            "profile_image": user.profile_image,
        }
    }), 200


@api.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify(user.serialize()), 200


@api.route("/profile/avatar", methods=["PUT"])
@jwt_required()
def update_profile_avatar():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json() or {}
    profile_image = body.get("profile_image")

    if not profile_image:
        return jsonify({"msg": "La imagen de perfil es obligatoria"}), 400

    user.profile_image = profile_image
    db.session.commit()

    return jsonify(user.serialize()), 200


@api.route("/spots", methods=["POST"])
@jwt_required()
def create_spot():
    user_id = int(get_jwt_identity())
    body = request.get_json() or {}

    titulo = body.get("titulo")
    descripcion = body.get("descripcion", "")
    latitude = body.get("latitude")
    longitude = body.get("longitude")
    images = body.get("images", [])

    if not titulo:
        return jsonify({"msg": "El título es obligatorio"}), 400

    category = Category.query.filter_by(nombre="General").first()

    if not category:
        category = Category(nombre="General")
        db.session.add(category)
        db.session.flush()

    location_str = f"{latitude},{longitude}" if latitude and longitude else None

    new_spot = Spot(
        user_id=user_id,
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


@api.route("/spots", methods=["GET"])
@jwt_required()
def get_spots():
    current_user_id = int(get_jwt_identity())

    spots = Spot.query.order_by(Spot.created_at.desc()).all()

    return jsonify([
        _serialize_spot(spot, current_user_id)
        for spot in spots
    ]), 200


@api.route("/spots/<int:spot_id>", methods=["GET"])
@jwt_required()
def get_single_spot(spot_id):
    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({"msg": "Spot no encontrado"}), 404

    return jsonify(_serialize_spot(spot, current_user_id)), 200


@api.route("/spots/<int:spot_id>/like", methods=["POST"])
@jwt_required()
def toggle_like(spot_id):
    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({"msg": "Spot no encontrado"}), 404

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

        if spot.user_id != current_user_id:
            sender = User.query.get(current_user_id)

            notification = Notification(
                recipient_id=spot.user_id,
                sender_id=current_user_id,
                spot_id=spot.id,
                comment_id=None,
                type="like",
                message=f"{sender.nombre} liked your spot: {spot.titulo}"
            )

            db.session.add(notification)

    db.session.commit()

    likes_count = Like.query.filter_by(spot_id=spot_id).count()

    return jsonify({
        "liked": liked,
        "likes": likes_count
    }), 200


@api.route("/spots/<int:spot_id>/favorite", methods=["POST"])
@jwt_required()
def toggle_favorite(spot_id):
    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({"msg": "Spot no encontrado"}), 404

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

    favorites_count = Favorite.query.filter_by(spot_id=spot_id).count()

    return jsonify({
        "saved": saved,
        "favorites": favorites_count
    }), 200


@api.route("/spots/<int:spot_id>", methods=["DELETE"])
@jwt_required()
def delete_spot(spot_id):
    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({"msg": "Spot no encontrado"}), 404

    current_user = User.query.get(current_user_id)

    if spot.user_id != current_user_id and current_user.tipo_usuario != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    db.session.delete(spot)
    db.session.commit()

    return jsonify({"msg": "Spot eliminado correctamente"}), 200


@api.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())

    users = User.query.filter(User.id != current_user_id).all()

    return jsonify([
        {
            "id": user.id,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "profile_image": user.profile_image,
        }
        for user in users
    ]), 200


@api.route("/spots/<int:spot_id>/comments", methods=["GET"])
@jwt_required()
def get_spot_comments(spot_id):
    current_user_id = int(get_jwt_identity())

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({"msg": "Spot no encontrado"}), 404

    comments = Comment.query.filter_by(
        spot_id=spot_id,
        parent_id=None
    ).order_by(Comment.created_at.asc()).all()

    return jsonify([
        comment.serialize(current_user_id)
        for comment in comments
    ]), 200


@api.route("/spots/<int:spot_id>/comments", methods=["POST"])
@jwt_required()
def add_spot_comment(spot_id):
    current_user_id = int(get_jwt_identity())
    body = request.get_json() or {}

    contenido = body.get("contenido", "").strip()

    if not contenido:
        return jsonify({"msg": "You might write something"}), 400

    if len(contenido) > 500:
        return jsonify({"msg": "Comment can not be more than 500 characters"}), 400

    spot = Spot.query.get(spot_id)

    if not spot:
        return jsonify({"msg": "Spot not found"}), 404

    nuevo_comentario = Comment(
        contenido=contenido,
        user_id=current_user_id,
        spot_id=spot_id,
        parent_id=None
    )

    db.session.add(nuevo_comentario)
    db.session.flush()

    if spot.user_id != current_user_id:
        sender = User.query.get(current_user_id)

        notification = Notification(
            recipient_id=spot.user_id,
            sender_id=current_user_id,
            spot_id=spot.id,
            comment_id=nuevo_comentario.id,
            type="comment",
            message=f"{sender.nombre} commented your spot: {contenido[:80]}"
        )

        db.session.add(notification)

    db.session.commit()

    return jsonify(nuevo_comentario.serialize(current_user_id)), 201


@api.route("/comments/<int:comment_id>/reply", methods=["POST"])
@jwt_required()
def reply_comment(comment_id):
    current_user_id = int(get_jwt_identity())
    body = request.get_json() or {}

    contenido = body.get("contenido", "").strip()

    if not contenido:
        return jsonify({"msg": "Answer can not be empty"}), 400

    if len(contenido) > 500:
        return jsonify({"msg": "La respuesta no puede pasar de 500 caracteres"}), 400

    parent = Comment.query.get(comment_id)

    if not parent:
        return jsonify({"msg": "Comment not found"}), 404

    if parent.parent_id is not None:
        return jsonify({"msg": "You can reply just the main comments"}), 400

    reply = Comment(
        contenido=contenido,
        user_id=current_user_id,
        spot_id=parent.spot_id,
        parent_id=comment_id
    )

    db.session.add(reply)
    db.session.flush()

    if parent.user_id != current_user_id:
        sender = User.query.get(current_user_id)

        notification = Notification(
            recipient_id=parent.user_id,
            sender_id=current_user_id,
            spot_id=parent.spot_id,
            comment_id=reply.id,
            type="reply",
            message=f"{sender.nombre} replied: {contenido[:80]}"
        )

        db.session.add(notification)

    db.session.commit()

    return jsonify(reply.serialize(current_user_id)), 201


@api.route("/comments/<int:comment_id>", methods=["PUT"])
@jwt_required()
def update_comment(comment_id):
    current_user_id = int(get_jwt_identity())
    body = request.get_json() or {}

    contenido = body.get("contenido", "").strip()

    if not contenido:
        return jsonify({"msg": "El comentario no puede estar vacío"}), 400

    if len(contenido) > 500:
        return jsonify({"msg": "El comentario no puede pasar de 500 caracteres"}), 400

    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({"msg": "Comentario no encontrado"}), 404

    current_user = User.query.get(current_user_id)

    if comment.user_id != current_user_id and current_user.tipo_usuario != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    comment.contenido = contenido
    db.session.commit()

    return jsonify(comment.serialize(current_user_id)), 200


@api.route("/comments/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = int(get_jwt_identity())

    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({"msg": "Comentario no encontrado"}), 404

    current_user = User.query.get(current_user_id)

    if comment.user_id != current_user_id and current_user.tipo_usuario != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"msg": "Comentario deleted"}), 200


@api.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user_id = int(get_jwt_identity())

    notifications = Notification.query.filter_by(
        recipient_id=current_user_id
    ).order_by(Notification.created_at.desc()).all()

    return jsonify([
        notification.serialize()
        for notification in notifications
    ]), 200


@api.route("/notifications/unread-count", methods=["GET"])
@jwt_required()
def get_unread_notifications_count():
    current_user_id = int(get_jwt_identity())

    count = Notification.query.filter_by(
        recipient_id=current_user_id,
        is_read=False
    ).count()

    return jsonify({"count": count}), 200


@api.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_as_read(notification_id):
    current_user_id = int(get_jwt_identity())

    notification = Notification.query.get(notification_id)

    if not notification:
        return jsonify({"msg": "Notificación no encontrada"}), 404

    if notification.recipient_id != current_user_id:
        return jsonify({"msg": "No autorizado"}), 403

    notification.is_read = True
    db.session.commit()

    return jsonify(notification.serialize()), 200


@api.route("/notifications/read-all", methods=["PUT"])
@jwt_required()
def mark_all_notifications_as_read():
    current_user_id = int(get_jwt_identity())

    notifications = Notification.query.filter_by(
        recipient_id=current_user_id,
        is_read=False
    ).all()

    for notification in notifications:
        notification.is_read = True

    db.session.commit()

    return jsonify({"msg": "Notificaciones marcadas como leídas"}), 200


def _serialize_spot(spot, current_user_id=None):
    lat, lng = None, None

    if spot.location:
        try:
            lat, lng = spot.location.split(",")
            lat = float(lat)
            lng = float(lng)
        except Exception:
            pass

    likes_count = Like.query.filter_by(spot_id=spot.id).count()
    favorites_count = Favorite.query.filter_by(spot_id=spot.id).count()
    comments_count = Comment.query.filter_by(
        spot_id=spot.id,
        parent_id=None
    ).count()

    liked = False
    saved = False

    if current_user_id:
        liked = Like.query.filter_by(
            spot_id=spot.id,
            user_id=int(current_user_id)
        ).first() is not None

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
        "comments_count": comments_count,
        "user": {
            "id": spot.user.id,
            "nombre": spot.user.nombre,
            "apellido": spot.user.apellido,
            "tipo_usuario": spot.user.tipo_usuario,
            "profile_image": spot.user.profile_image,
        } if spot.user else None,
        "images": [img.image_url for img in spot.images],
    }


@api.route("/users/following", methods=["GET"])
@jwt_required()
def get_following():
    current_user_id = get_jwt_identity()
    follows = Follow.query.filter_by(follower_id=current_user_id).all()
    return jsonify([f.followed.serialize_public() for f in follows]), 200


# POST /api/users/<id>/follow  → seguir o dejar de seguir
@api.route("/users/<int:target_id>/follow", methods=["POST"])
@jwt_required()
def toggle_follow(target_id):
    current_user_id = int(get_jwt_identity())

    if current_user_id == target_id:
        return jsonify({"msg": "No puedes seguirte a ti mismo"}), 400

    target_user = User.query.get(target_id)
    if not target_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    existing = Follow.query.filter_by(
        follower_id=current_user_id,
        followed_id=target_id
    ).first()

    if existing:
        # Ya lo sigue → dejar de seguir
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"is_following": False}), 200
    else:
        # No lo sigue → seguir
        follow = Follow(follower_id=current_user_id, followed_id=target_id)
        db.session.add(follow)

        # Notificación al usuario seguido
        current_user = User.query.get(current_user_id)
        notification = Notification(
            recipient_id=target_id,
            sender_id=current_user_id,
            type="follow",
            message=f"{current_user.nombre} {current_user.apellido} started following you",
        )
        db.session.add(notification)
        db.session.commit()

        return jsonify({"is_following": True}), 200


# GET /api/users/me/following  → lista de usuarios que sigo
@api.route("/users/me/following", methods=["GET"])
@jwt_required()
def get_my_following():
    current_user_id = int(get_jwt_identity())

    follows = Follow.query.filter_by(follower_id=current_user_id).all()

    return jsonify([
        {
            "id": f.followed.id,
            "nombre": f.followed.nombre,
            "apellido": f.followed.apellido,
        }
        for f in follows
    ]), 200


@api.route("/users/me/followers", methods=["GET"])
@jwt_required()
def get_my_followers():
    current_user_id = int(get_jwt_identity())

    count = Follow.query.filter_by(followed_id=current_user_id).count()

    return jsonify({"count": count}), 200


@api.route("/users/<int:user_id>/followers", methods=["GET"])
@jwt_required()
def get_user_followers(user_id):
    count = Follow.query.filter_by(followed_id=user_id).count()
    return jsonify({"count": count}), 200


@api.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_by_id(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify({
        "id": user.id,
        "nombre": user.nombre,
        "apellido": user.apellido,
        "tipo_usuario": user.tipo_usuario,
    }), 200
