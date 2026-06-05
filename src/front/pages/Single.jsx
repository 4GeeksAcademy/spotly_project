import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Heart,
  Bookmark,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { CommentBox } from "../components/CommentBox";

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
        console.error(data.msg || "Error loading spot");
      }
    } catch (error) {
      console.error("Network error loading spot:", error);
    } finally {
      setLoading(false);
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
          />

          <div>
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
          <span>
            <Heart size={20} /> {spot.likes_count ?? spot.likes ?? 0}
          </span>

          <button
            onClick={() => setShowComments(!showComments)}
            className="like-btn"
          >
            <MessageCircle size={20} />
            {spot.comments_count || 0}
          </button>

          <span>
            <Bookmark size={20} />{" "}
            {spot.favorites_count ?? spot.favorites ?? 0}
          </span>
        </div>

        {showComments && <CommentBox spotId={spot.id} token={store.token} />}
      </article>
    </div>
  );
};