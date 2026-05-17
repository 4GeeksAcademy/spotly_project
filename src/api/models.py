from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy import CheckConstraint
from sqlalchemy import Enum
from sqlalchemy.types import DECIMAL

db = SQLAlchemy()


# =========================================================
# USERS
# =========================================================
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20))
    pais = db.Column(db.String(80))
    genero = db.Column(db.String(20))

    tipo_usuario = db.Column(
        Enum('user', 'admin', name='tipo_usuario_enum'),
        nullable=False,
        server_default='user'
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    # Relaciones
    spots = db.relationship('Spot', back_populates='user', lazy=True)

    comments = db.relationship(
        'Comment',
        back_populates='user',
        cascade='all, delete-orphan',
        lazy=True
    )

    ratings = db.relationship(
        'Rating',
        back_populates='user',
        cascade='all, delete-orphan',
        lazy=True
    )

    favorites = db.relationship(
        'Favorite',
        back_populates='user',
        cascade='all, delete-orphan',
        lazy=True
    )

    views = db.relationship(
        'View',
        back_populates='user',
        cascade='all, delete-orphan',
        lazy=True
    )

    posts = db.relationship(
        'Post',
        back_populates='user',
        cascade='all, delete-orphan',
        lazy=True
    )


# =========================================================
# CATEGORIES
# =========================================================
class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    # Relaciones
    spots = db.relationship(
        'Spot',
        back_populates='category',
        lazy=True
    )


# =========================================================
# SPOTS
# =========================================================
class Spot(db.Model):
    __tablename__ = 'spots'

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    category_id = db.Column(
        db.Integer,
        db.ForeignKey('categories.id'),
        nullable=False
    )

    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)

    # POINT para MySQL/PostgreSQL
    location = db.Column(db.String(100))

    direccion = db.Column(db.String(255))

    rating_promedio = db.Column(
        DECIMAL(3, 2),
        server_default='0.00'
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    # Relaciones
    user = db.relationship(
        'User',
        back_populates='spots'
    )

    category = db.relationship(
        'Category',
        back_populates='spots'
    )

    images = db.relationship(
        'SpotImage',
        back_populates='spot',
        cascade='all, delete-orphan',
        lazy=True
    )

    comments = db.relationship(
        'Comment',
        back_populates='spot',
        cascade='all, delete-orphan',
        lazy=True
    )

    ratings = db.relationship(
        'Rating',
        back_populates='spot',
        cascade='all, delete-orphan',
        lazy=True
    )

    favorites = db.relationship(
        'Favorite',
        back_populates='spot',
        cascade='all, delete-orphan',
        lazy=True
    )

    views = db.relationship(
        'View',
        back_populates='spot',
        cascade='all, delete-orphan',
        lazy=True
    )

    posts = db.relationship(
        'Post',
        back_populates='spot',
        cascade='all, delete-orphan',
        lazy=True
    )


# =========================================================
# SPOT_IMAGES
# =========================================================
class SpotImage(db.Model):
    __tablename__ = 'spot_images'

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(
        db.Integer,
        db.ForeignKey('spots.id'),
        nullable=False
    )

    image_url = db.Column(
        db.String(500),
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    # Relaciones
    spot = db.relationship(
        'Spot',
        back_populates='images'
    )


# =========================================================
# COMMENTS
# =========================================================
class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(
        db.Integer,
        db.ForeignKey('spots.id'),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    contenido = db.Column(
        db.Text,
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    # Relaciones
    spot = db.relationship(
        'Spot',
        back_populates='comments'
    )

    user = db.relationship(
        'User',
        back_populates='comments'
    )


# =========================================================
# RATINGS
# =========================================================
class Rating(db.Model):
    __tablename__ = 'ratings'

    __table_args__ = (
        CheckConstraint(
            'valor >= 1 AND valor <= 5',
            name='check_rating_value'
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(
        db.Integer,
        db.ForeignKey('spots.id'),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    valor = db.Column(
        DECIMAL(3, 2),
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    # Relaciones
    spot = db.relationship(
        'Spot',
        back_populates='ratings'
    )

    user = db.relationship(
        'User',
        back_populates='ratings'
    )


# =========================================================
# FAVORITES
# =========================================================
class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(
        db.Integer,
        db.ForeignKey('spots.id'),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    # Relaciones
    spot = db.relationship(
        'Spot',
        back_populates='favorites'
    )

    user = db.relationship(
        'User',
        back_populates='favorites'
    )


# =========================================================
# VIEWS
# =========================================================
class View(db.Model):
    __tablename__ = 'views'

    id = db.Column(db.Integer, primary_key=True)

    spot_id = db.Column(
        db.Integer,
        db.ForeignKey('spots.id'),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    # Relaciones
    spot = db.relationship(
        'Spot',
        back_populates='views'
    )

    user = db.relationship(
        'User',
        back_populates='views'
    )


# =========================================================
# POSTS
# =========================================================
class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    spot_id = db.Column(
        db.Integer,
        db.ForeignKey('spots.id'),
        nullable=True
    )

    titulo = db.Column(
        db.String(200),
        nullable=False
    )

    contenido = db.Column(
        db.Text,
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp()
    )

    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    # Relaciones
    user = db.relationship(
        'User',
        back_populates='posts'
    )

    spot = db.relationship(
        'Spot',
        back_populates='posts'
    )
