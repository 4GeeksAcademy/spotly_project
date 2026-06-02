import { X, MapPin, Heart, Bookmark, Share2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "leaflet/dist/leaflet.css";

import { CommentBox } from "./CommentBox";


export const SpotDetailsModal = ({ spot, onClose }) => {
  const { store } = useGlobalReducer();
  const [visible, setVisible] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (spot) {
      const image =
        spot.images?.[0] ||
        spot.image ||
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200";

      setActiveImage(image);
      requestAnimationFrame(() => setVisible(true));
    }
  }, [spot]);

  if (!spot) return null;

  const isDark = store.theme === "dark";

  const images =
    spot.images?.length > 0
      ? spot.images
      : [
          spot.image ||
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
        ];

  const hasLocation = spot.latitude && spot.longitude;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 220);
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
          <img src={activeImage} alt={spot.titulo || "Spot"} />
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
              <h2>{spot.titulo || spot.title || "Untitled Spot"}</h2>

              <p className="spot-details-location">
                <MapPin size={17} />
                {spot.location || "Location not specified"}
              </p>
            </div>

            <span className="spot-details-category">
              {spot.category || "Spot"}
            </span>
          </div>

          <div className="spot-details-actions-row">
            <button>
              <Heart size={19} />
              {spot.likes || 0}
            </button>

            <button>
              <Bookmark size={19} />
              Save
            </button>

            <button>
              <Share2 size={19} />
              Share
            </button>
          </div>

          <p className="spot-details-description">
            {spot.descripcion || spot.description || "No description available."}
          </p>

          <div className="spot-details-author">
            <div className="author-avatar">
              <User size={22} />
            </div>

            <div>
              <strong>
                {spot.user?.nombre ||
                  spot.creator?.nombre ||
                  spot.author?.nombre ||
                  "Spotly User"}
              </strong>
              <p>Spot creator</p>
            </div>
          </div>

          {hasLocation && (
            <div className="spot-details-map">
              <MapContainer
                center={[spot.latitude, spot.longitude]}
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

                <Marker position={[spot.latitude, spot.longitude]}>
                  <Popup>{spot.titulo || "Spot"}</Popup>
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