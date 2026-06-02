from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy import CheckConstraint, Enum
from sqlalchemy.types import DECIMAL

db = SQLAlchemy()


# =========================================================
# USERS
# =========================================================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20))
    pais = db.Column(db.String(80))
    genero = db.Column(db.String(20))

    tipo_usuario = db.Column(
        Enum("user", "admin", name="tipo_usuario_enum"),
        nullable=False,
        server_default="user"
    )

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    spots = db.relationship("Spot", back_populates="user", cascade="all, delete-orphan", lazy=True)
    comments = db.relationship("Comment", back_populates="user", cascade="all, delete-orphan", lazy=True)
    ratings = db.relationship("Rating", back_populates="user", cascade="all, delete-orphan", lazy=True)
    favorites = db.relationship("Favorite", back_populates="user", cascade="all, delete-orphan", lazy=True)
    likes = db.relationship("Like", back_populates="user", cascade="all, delete-orphan", lazy=True)
    views = db.relationship("View", back_populates="user", cascade="all, delete-orphan", lazy=True)
    posts = db.relationship("Post", back_populates="user", cascade="all, delete-orphan", lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email": self.email,
            "telefono": self.telefono,
            "pais": self.pais,
            "genero": self.genero,
            "tipo_usuario": self.tipo_usuario,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def serialize_public(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "tipo_usuario": self.tipo_usuario,
        }


# =========================================================
# CATEGORIES
# =========================================================
class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    spots = db.relationship("Spot", back_populates="category", lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# =========================================================
# SPOTS
# =========================================================
class Spot(db.Model):
    __tablename__ = "spots"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)

    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    location = db.Column(db.String(100))
    direccion = db.Column(db.String(255))

    rating_promedio = db.Column(DECIMAL(3, 2), server_default="0.00")

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    user = db.relationship("User", back_populates="spots")
    category = db.relationship("Category", back_populates="spots")
    images = db.relationship("SpotImage", back_populates="spot", cascade="all, delete-orphan", lazy=True)
    comments = db.relationship("Comment", back_populates="spot", cascade="all, delete-orphan", lazy=True)
    ratings = db.relationship("Rating", back_populates="spot", cascade="all, delete-orphan", lazy=True)
    favorites = db.relationship("Favorite", back_populates="spot", cascade="all, delete-orphan", lazy=True)
    likes = db.relationship("Like", back_populates="spot", cascade="all, delete-orphan", lazy=True)
    views = db.relationship("View", back_populates="spot", cascade="all, delete-orphan", lazy=True)
    posts = db.relationship("Post", back_populates="spot", cascade="all, delete-orphan", lazy=True)

    def serialize(self, current_user_id=None):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "location": self.location,
            "direccion": self.direccion,
            "rating_promedio": float(self.rating_promedio or 0),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user": self.user.serialize_public() if self.user else None,
            "category": self.category.serialize() if self.category else None,
            "images": [image.serialize() for image in self.images],
            "comments_count": len(self.comments),
            "likes_count": len(self.likes),
            "favorites_count": len(self.favorites),
            "views_count": len(self.views),
            "is_liked": any(like.user_id == int(current_user_id) for like in self.likes) if current_user_id else False,
            "is_favorite": any(fav.user_id == int(current_user_id) for fav in self.favorites) if current_user_id else False,
        }


# =========================================================
# SPOT_IMAGES
# =========================================================
class SpotImage(db.Model):
    __tablename__ = "spot_images"

    id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())

    spot = db.relationship("Spot", back_populates="images")

    def serialize(self):
        return {
            "id": self.id,
            "spot_id": self.spot_id,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# =========================================================
# COMMENTS
# =========================================================
class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    contenido = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    spot = db.relationship("Spot", back_populates="comments")
    user = db.relationship("User", back_populates="comments")

    def serialize(self, current_user_id=None):
        return {
            "id": self.id,
            "spot_id": self.spot_id,
            "user_id": self.user_id,
            "contenido": self.contenido,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "can_edit": int(current_user_id) == self.user_id if current_user_id else False,
            "user": self.user.serialize_public() if self.user else None,
        }


# =========================================================
# RATINGS
# =========================================================
class Rating(db.Model):
    __tablename__ = "ratings"

    __table_args__ = (
        CheckConstraint("valor >= 1 AND valor <= 5", name="check_rating_value"),
        db.UniqueConstraint("user_id", "spot_id", name="unique_user_spot_rating"),
    )

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    valor = db.Column(DECIMAL(3, 2), nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    spot = db.relationship("Spot", back_populates="ratings")
    user = db.relationship("User", back_populates="ratings")

    def serialize(self):
        return {
            "id": self.id,
            "spot_id": self.spot_id,
            "user_id": self.user_id,
            "valor": float(self.valor),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user": self.user.serialize_public() if self.user else None,
        }


# =========================================================
# FAVORITES
# =========================================================
class Favorite(db.Model):
    __tablename__ = "favorites"

    __table_args__ = (
        db.UniqueConstraint("user_id", "spot_id", name="unique_user_spot_favorite"),
    )

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())

    spot = db.relationship("Spot", back_populates="favorites")
    user = db.relationship("User", back_populates="favorites")

    def serialize(self):
        return {
            "id": self.id,
            "spot_id": self.spot_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# =========================================================
# LIKES
# =========================================================
class Like(db.Model):
    __tablename__ = "likes"

    __table_args__ = (
        db.UniqueConstraint("user_id", "spot_id", name="unique_user_spot_like"),
    )

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())

    spot = db.relationship("Spot", back_populates="likes")
    user = db.relationship("User", back_populates="likes")

    def serialize(self):
        return {
            "id": self.id,
            "spot_id": self.spot_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# =========================================================
# VIEWS
# =========================================================
class View(db.Model):
    __tablename__ = "views"

    __table_args__ = (
        db.UniqueConstraint("user_id", "spot_id", name="unique_user_spot_view"),
    )

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())

    spot = db.relationship("Spot", back_populates="views")
    user = db.relationship("User", back_populates="views")

    def serialize(self):
        return {
            "id": self.id,
            "spot_id": self.spot_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# =========================================================
# POSTS
# =========================================================
class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    spot_id = db.Column(db.Integer, db.ForeignKey("spots.id"), nullable=True)

    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    user = db.relationship("User", back_populates="posts")
    spot = db.relationship("Spot", back_populates="posts")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "spot_id": self.spot_id,
            "titulo": self.titulo,
            "contenido": self.contenido,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user": self.user.serialize_public() if self.user else None,
        }