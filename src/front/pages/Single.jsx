import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Heart,
  Bookmark,
  MessageCircle,
  ArrowLeft,
  Share2,
  Copy,
  Mail,
  Send,
  Globe,
  X,
} from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { CommentBox } from "../components/CommentBox";

export const Single = () => {
  const { theId } = useParams();
  const { store, dispatch } = useGlobalReducer();

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const showToast = (message, type = "success") => {
    dispatch({
      type: "show_toast",
      payload: { message, type },
    });
  };

  useEffect(() => {
    getSingleSpot();
  }, [theId]);

  const getSingleSpot = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}api/spots/${theId}`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSpot(data);
        setSelectedImage(data.images?.[0] || null);
      } else {
        console.error(data.msg || "Error loading spot");
        showToast(data.msg || "Error loading spot", "error");
      }
    } catch (error) {
      console.error("Network error loading spot:", error);
      showToast("Network error loading spot", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!spot) return;

    try {
      const response = await fetch(`${API_URL}api/spots/${spot.id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.msg || "Error liking spot");
        showToast(data.msg || "Error liking spot", "error");
        return;
      }

      setSpot((prev) => ({
        ...prev,
        liked: data.liked,
        likes: data.likes,
      }));

      showToast(data.liked ? "Spot liked!" : "Like removed", "success");
    } catch (error) {
      console.error("Network error liking spot:", error);
      showToast("Network error liking spot", "error");
    }
  };

  const toggleFavorite = async () => {
    if (!spot) return;

    try {
      const response = await fetch(`${API_URL}api/spots/${spot.id}/favorite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.msg || "Error saving spot");
        showToast(data.msg || "Error saving spot", "error");
        return;
      }

      setSpot((prev) => ({
        ...prev,
        saved: data.saved,
        favorites: data.favorites,
      }));

      showToast(data.saved ? "Spot saved!" : "Spot removed from saved", "success");
    } catch (error) {
      console.error("Network error saving spot:", error);
      showToast("Network error saving spot", "error");
    }
  };

  const getSpotUrl = () => `${window.location.origin}/single/${spot.id}`;

  const getShareText = () => {
    return `Check out this Spotly spot: ${spot?.titulo || "Spot"}`;
  };

  const copySpotLink = async () => {
    if (!spot) return;

    try {
      await navigator.clipboard.writeText(getSpotUrl());
      setCopied(true);
      showToast("Link copied!", "success");
    } catch (error) {
      console.error("Error copying link:", error);
      showToast("Could not copy link", "error");
    }
  };

  const nativeShareSpot = async () => {
    if (!spot) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: spot.titulo,
          text: getShareText(),
          url: getSpotUrl(),
        });

        showToast("Spot shared!", "success");
      } catch (error) {
        console.error("Native share cancelled or failed:", error);
      }
    } else {
      await copySpotLink();
    }
  };

  const openShareWindow = (platform) => {
    if (!spot) return;

    const spotUrl = encodeURIComponent(getSpotUrl());
    const text = encodeURIComponent(getShareText());

    const urls = {
      whatsapp: `https://wa.me/?text=${text}%20${spotUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${spotUrl}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${spotUrl}`,
      telegram: `https://t.me/share/url?url=${spotUrl}&text=${text}`,
      email: `mailto:?subject=${encodeURIComponent(spot.titulo)}&body=${text}%0A%0A${spotUrl}`,
      instagram: `https://www.instagram.com/`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer");
    showToast(`Opening ${platform}...`, "info");
  };

  if (loading) {
    return (
      <div className="single-spot-page">
        <div className="single-loading-card">Loading spot...</div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="single-spot-page">
        <div className="single-loading-card">
          <h2>Spot not found</h2>
          <Link to="/dashboard">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="single-spot-page">
      <Link to="/dashboard" className="single-back-btn">
        <ArrowLeft size={18} />
        Back to dashboard
      </Link>

      <article className="single-spot-card single-spot-card--wide">
        <div className="single-spot-layout">
          <div className="single-spot-media">
            {selectedImage ? (
              <img
                className="single-main-image"
                src={selectedImage}
                alt={spot.titulo}
              />
            ) : (
              <div className="single-image-placeholder">
                <MapPin size={32} />
                <span>No image available</span>
              </div>
            )}

            {spot.images?.length > 1 && (
              <div className="single-thumbnails">
                {spot.images.map((image, index) => (
                  <button
                    key={index}
                    className={`single-thumbnail ${
                      selectedImage === image ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img src={image} alt={`${spot.titulo} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="single-spot-info">
            <div className="post-header">
              <img
                src={`https://i.pravatar.cc/100?u=${spot.user?.id}`}
                alt={spot.user?.nombre}
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
                Open location in Google Maps
              </a>
            )}

            {spot.latitude != null && spot.longitude != null && (
              <div className="single-coordinates">
                {Number(spot.latitude).toFixed(5)},{" "}
                {Number(spot.longitude).toFixed(5)}
              </div>
            )}

            <div className="single-action-row">
              <button
                className={`single-action-btn ${spot.liked ? "active" : ""}`}
                onClick={toggleLike}
              >
                <Heart
                  size={20}
                  fill={spot.liked ? "#ef3340" : "none"}
                  color={spot.liked ? "#ef3340" : "currentColor"}
                />
                {spot.likes || 0}
              </button>

              <button
                className="single-action-btn"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle size={20} />
                {spot.comments_count || 0}
              </button>

              <button
                className={`single-action-btn ${spot.saved ? "active" : ""}`}
                onClick={toggleFavorite}
              >
                <Bookmark
                  size={20}
                  fill={spot.saved ? "#ff5a5f" : "none"}
                  color={spot.saved ? "#ff5a5f" : "currentColor"}
                />
                {spot.favorites || 0}
              </button>

              <button
                className="single-action-btn"
                onClick={() => {
                  setCopied(false);
                  setShowShareModal(true);
                }}
              >
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>
        </div>

        {showComments && (
          <div className="single-comments-section">
            <CommentBox spotId={spot.id} token={store.token} />
          </div>
        )}
      </article>

      {showShareModal && (
        <div
          className="share-modal-overlay"
          onClick={() => setShowShareModal(false)}
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <div>
                <h3>Share spot</h3>
                <p>{spot.titulo}</p>
              </div>

              <button onClick={() => setShowShareModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="share-options">
              <button onClick={() => openShareWindow("whatsapp")}>
                <Send size={20} />
                WhatsApp
              </button>

              <button onClick={() => openShareWindow("facebook")}>
                <Globe size={20} />
                Facebook
              </button>

              <button onClick={() => openShareWindow("x")}>
                <X size={20} />
                X / Twitter
              </button>

              <button onClick={() => openShareWindow("telegram")}>
                <Send size={20} />
                Telegram
              </button>

              <button onClick={() => openShareWindow("email")}>
                <Mail size={20} />
                Email
              </button>

              <button onClick={() => openShareWindow("instagram")}>
                <Globe size={20} />
                Instagram
              </button>

              <button onClick={nativeShareSpot}>
                <Share2 size={20} />
                More options
              </button>

              <button onClick={copySpotLink}>
                <Copy size={20} />
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};