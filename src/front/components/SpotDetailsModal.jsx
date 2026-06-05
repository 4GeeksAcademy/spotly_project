import { X, MapPin, Heart, Bookmark, Share2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";

import { CommentBox } from "./CommentBox";


export const SpotDetailsModal = ({ spot, onClose }) => {
  const { store } = useGlobalReducer();
  const [visible, setVisible] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [localSpot, setLocalSpot] = useState(null);

  useEffect(() => {
    if (spot) {
      const image =
        spot.images?.[0] ||
        spot.image ||
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200";

      setLocalSpot(spot);
      setActiveImage(image);
      requestAnimationFrame(() => setVisible(true));
    }
  }, [spot]);

  if (!spot || !localSpot) return null;

  const isDark = store.theme === "dark";

  const images =
    localSpot.images?.length > 0
      ? localSpot.images
      : [
          localSpot.image ||
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
        ];

  const hasLocation = localSpot.latitude && localSpot.longitude;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 220);
  };

  const toggleLike = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${localSpot.id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.msg || "Error liking spot");
        return;
      }

      setLocalSpot((prev) => ({
        ...prev,
        liked: data.liked,
        likes: data.likes,
      }));
    } catch (err) {
      console.error("Network error liking spot", err);
    }
  };

  const toggleFavorite = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${localSpot.id}/favorite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.msg || "Error saving spot");
        return;
      }

      setLocalSpot((prev) => ({
        ...prev,
        saved: data.saved,
        favorites: data.favorites,
      }));
    } catch (err) {
      console.error("Network error saving spot", err);
    }
  };

  const handleShare = async () => {
    const shareText = `${localSpot.titulo || "Spot"} - ${
      localSpot.descripcion || "Check this spot on Spotly"
    }`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: localSpot.titulo || "Spotly Spot",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Spot copied to clipboard");
      }
    } catch (err) {
      console.error("Error sharing spot", err);
    }
  };

  return (
    <div className="spot-details-modal-overlay" onClick={handleClose}>
      <div
        className={`spot-details-modal ${isDark ? "dark" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: visible ? "scale(1)" : "scale(0.96)",
          opacity: visible ? 1 : 0,
        }}
      >
        <button className="spot-details-close" onClick={handleClose}>
          <X size={20} />
        </button>

        <div className="spot-details-hero">
          <img src={activeImage} alt={localSpot.titulo || "Spot"} />
        </div>

        {images.length > 1 && (
          <div className="spot-details-thumbnails">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Spot ${index + 1}`}
                className={activeImage === img ? "active" : ""}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
        )}

        <div className="spot-details-body">
          <div className="spot-details-title-row">
            <div>
              <h2>{localSpot.titulo || localSpot.title || "Untitled Spot"}</h2>

              <p className="spot-details-location">
                <MapPin size={17} />
                {localSpot.location || "Location not specified"}
              </p>
            </div>

            <span className="spot-details-category">
              {localSpot.category || "Spot"}
            </span>
          </div>

          <div className="spot-details-actions-row">
            <button onClick={toggleLike}>
              <Heart
                size={19}
                fill={localSpot.liked ? "#ef3340" : "none"}
                color={localSpot.liked ? "#ef3340" : "currentColor"}
              />
              {localSpot.likes || 0}
            </button>

            <button onClick={toggleFavorite}>
              <Bookmark
                size={19}
                fill={localSpot.saved ? "#ef3340" : "none"}
                color={localSpot.saved ? "#ef3340" : "currentColor"}
              />
              
              {localSpot.favorites ? ` ${localSpot.favorites}` : ""}
            </button>

            <button onClick={handleShare}>
              <Share2 size={19} />
              Share
            </button>
          </div>

          <p className="spot-details-description">
            {localSpot.descripcion ||
              localSpot.description ||
              "No description available."}
          </p>

          <div className="spot-details-author">
            <div className="author-avatar">
              <User size={22} />
            </div>

            <div>
              <strong>
                {localSpot.user?.nombre ||
                  localSpot.creator?.nombre ||
                  localSpot.author?.nombre ||
                  "Spotly User"}
              </strong>
              <p>Spot creator</p>
            </div>
          </div>

          {hasLocation && (
            <div className="spot-details-map">
              <MapContainer
                center={[localSpot.latitude, localSpot.longitude]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url={
                    isDark
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />

                <Marker position={[localSpot.latitude, localSpot.longitude]}>
                  <Popup>{localSpot.titulo || "Spot"}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}


<CommentBox spotId={spot.id} token={store.token} />

        </div>
      </div>
    </div>
  );
};