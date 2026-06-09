import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Heart,
  Bookmark,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { CommentBox } from "../components/CommentBox";
import toast from "react-hot-toast";

const getAvatar = (user) =>
  user?.profile_image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || "Spotly User"
  )}&background=ef3340&color=fff`;

const normalizeImages = (images = []) =>
  images
    .map((image) => (typeof image === "string" ? image : image?.image_url))
    .filter(Boolean);

export const Single = () => {
  const { theId } = useParams();
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    getSingleSpot();
  }, [theId]);

  const getSingleSpot = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${theId}`,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSpot(data);
      } else {
        toast.error(data.msg || "Error loading spot");
      }
    } catch (error) {
      console.error("Network error loading spot:", error);
      toast.error("Network error loading spot");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!spot) return;

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${spot.id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.msg || "Error liking spot");
        return;
      }

      setSpot((prev) => ({
        ...prev,
        liked: data.liked,
        is_liked: data.liked,
        likes: data.likes,
        likes_count: data.likes,
      }));
    } catch (error) {
      console.error("Network error liking spot:", error);
      toast.error("Network error liking spot");
    }
  };

  const toggleFavorite = async () => {
    if (!spot) return;

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${spot.id}/favorite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.msg || "Error saving spot");
        return;
      }

      setSpot((prev) => ({
        ...prev,
        saved: data.saved,
        is_favorite: data.saved,
        favorites: data.favorites,
        favorites_count: data.favorites,
      }));
    } catch (error) {
      console.error("Network error saving spot:", error);
      toast.error("Network error saving spot");
    }
  };

  if (loading) {
    return <div className="single-spot-page">Loading spot...</div>;
  }

  if (!spot) {
    return (
      <div className="single-spot-page">
        <h2>Spot not found</h2>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  const images = normalizeImages(spot.images);
  const isLiked = spot.liked || spot.is_liked;
  const isSaved = spot.saved || spot.is_favorite;

  return (
    <div className="single-spot-page">
      <Link to="/dashboard" className="single-back-btn">
        <ArrowLeft size={18} />
        Back to dashboard
      </Link>

      <article className="single-spot-card">
        <div className="post-header">
          <img
            src={getAvatar(spot.user)}
            alt={spot.user?.nombre || "User"}
            onClick={() => spot.user?.id && navigate(`/profile/${spot.user.id}`)}
            style={{ cursor: "pointer" }}
          />

          <div
            onClick={() => spot.user?.id && navigate(`/profile/${spot.user.id}`)}
            style={{ cursor: "pointer" }}
          >
            <strong>
              {spot.user?.nombre} {spot.user?.apellido}
            </strong>
            <p>
              {spot.created_at
                ? new Date(spot.created_at).toLocaleString()
                : ""}
            </p>
          </div>
        </div>

        <h1>{spot.titulo}</h1>

        <p className="post-text">{spot.descripcion}</p>

        {spot.latitude != null && spot.longitude != null && (
          <a
            href={`https://www.google.com/maps?q=${spot.latitude},${spot.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="single-location-link"
          >
            <MapPin size={16} />
            {Number(spot.latitude).toFixed(5)},{" "}
            {Number(spot.longitude).toFixed(5)}
          </a>
        )}

        {images.length > 0 && (
          <div className="single-images-grid">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${spot.titulo || "Spot"} ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="post-actions single-post-actions">
          <button className="like-btn" onClick={toggleLike}>
            <Heart
              size={20}
              fill={isLiked ? "#ef3340" : "none"}
              color={isLiked ? "#ef3340" : "currentColor"}
            />
            {spot.likes_count ?? spot.likes ?? 0}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="like-btn"
          >
            <MessageCircle size={20} />
            {spot.comments_count || 0}
          </button>

          <button className="like-btn" onClick={toggleFavorite}>
            <Bookmark
              size={20}
              fill={isSaved ? "#ff5a5f" : "none"}
              color={isSaved ? "#ff5a5f" : "currentColor"}
            />
            {spot.favorites_count ?? spot.favorites ?? 0}
          </button>
        </div>

        {showComments && <CommentBox spotId={spot.id} token={store.token} />}
      </article>
    </div>
  );
};