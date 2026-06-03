import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
};

export const SpotModal = ({ isOpen, onClose, onSpotCreated }) => {
  const { store, dispatch } = useGlobalReducer();

  const isDark = store.theme === "dark";

  const colors = {
    modalBg: isDark ? "#111827" : "#ffffff",
    text: isDark ? "#f9fafb" : "#111827",
    muted: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    inputBg: isDark ? "#0b0f17" : "#ffffff",
    inputText: isDark ? "#f9fafb" : "#111827",
    softBg: isDark ? "#1f2937" : "#f3f4f6",
    danger: "#ff5a5f",
  };

  const [userPosition, setUserPosition] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [myImages, setMyImages] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  const overlayRef = useRef(null);
  const activePosition = selectedPosition || userPosition;

  const showToast = (message, type = "success") => {
    dispatch({
      type: "show_toast",
      payload: { message, type },
    });
  };

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by this browser", "warning");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(coords);
      },
      (err) => {
        console.error("Geolocation error:", err);
        showToast("Could not access your location", "warning");
      }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);

    setTimeout(() => {
      setNombre("");
      setDescripcion("");
      setMyImages([]);
      setSelectedPosition(null);
      setError("");
      onClose();
    }, 250);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    if (!files.length) return;

    setUploadingImages(true);
    setError("");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + "api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const url = await response.json();

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        uploadedUrls.push(url);
      }

      setMyImages((prev) => [...prev, ...uploadedUrls]);

      showToast(
        uploadedUrls.length === 1
          ? "Image uploaded!"
          : `${uploadedUrls.length} images uploaded!`,
        "success"
      );
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Images could not be uploaded.");
      showToast("Images could not be uploaded", "error");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setMyImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    showToast("Image removed", "info");
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError("Spot name is required.");
      showToast("Spot name is required", "warning");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({
          titulo: nombre,
          descripcion,
          latitude: activePosition?.[0] ?? null,
          longitude: activePosition?.[1] ?? null,
          images: myImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Error creating spot.");
        showToast(data.msg || "Error creating spot", "error");
        return;
      }

      onSpotCreated?.(data.spot);
      showToast("Spot created!", "success");
      handleClose();
    } catch (err) {
      console.error("Network error creating spot:", err);
      setError("Network error creating spot.");
      showToast("Network error creating spot", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const mapCenter = activePosition || userPosition || [20.6767, -101.3563];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: `rgba(0,0,0,${visible ? 0.35 : 0})`,
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
        transition: "all 250ms ease",
      }}
    >
      <div
        style={{
          background: colors.modalBg,
          color: colors.text,
          borderRadius: "1.5rem",
          boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.97)",
          opacity: visible ? 1 : 0,
          transition: "all 300ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: colors.modalBg,
            zIndex: 2,
            borderRadius: "1.5rem 1.5rem 0 0",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800 }}>
              Create Spot
            </h2>

            <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: "0.9rem" }}>
              Posting as <strong>{store.user?.nombre}</strong>
            </p>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: colors.softBg,
              color: colors.text,
              border: "none",
              borderRadius: "50%",
              width: 38,
              height: 38,
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "1rem 1.5rem 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "0.6rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: colors.muted }}>
              📍 Click on the map to select a location
            </span>

            {selectedPosition && (
              <button
                onClick={() => setSelectedPosition(null)}
                style={{
                  fontSize: "0.8rem",
                  color: colors.danger,
                  background: "transparent",
                  border: `1px solid ${colors.danger}`,
                  borderRadius: "8px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Use my location
              </button>
            )}
          </div>

          <div
            style={{
              borderRadius: "1rem",
              overflow: "hidden",
              height: "clamp(220px, 35vh, 380px)",
              border: `1px solid ${colors.border}`,
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{
                height: "100%",
                width: "100%",
                cursor: "crosshair",
              }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url={
                  isDark
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />

              <LocationPicker onLocationSelect={setSelectedPosition} />

              {activePosition && (
                <Marker position={activePosition}>
                  <Popup>
                    {selectedPosition ? "Selected location" : "Your location"}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {activePosition && (
            <p
              style={{
                color: colors.muted,
                fontSize: "0.75rem",
                textAlign: "right",
                margin: "0.45rem 0 0",
              }}
            >
              {activePosition[0].toFixed(5)}, {activePosition[1].toFixed(5)}
              {selectedPosition ? " · selected" : " · GPS"}
            </p>
          )}
        </div>

        <div
          style={{
            padding: "1rem 1.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
          }}
        >
          {error && (
            <div
              style={{
                background: isDark ? "rgba(239,51,64,0.15)" : "#fff1f2",
                color: colors.danger,
                border: `1px solid ${colors.danger}`,
                padding: "0.75rem 1rem",
                borderRadius: "0.9rem",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Spot name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{
              width: "100%",
              border: `1px solid ${colors.border}`,
              borderRadius: "0.85rem",
              padding: "0.85rem 1rem",
              background: colors.inputBg,
              color: colors.inputText,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <textarea
            placeholder="Describe this place..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{
              width: "100%",
              border: `1px solid ${colors.border}`,
              borderRadius: "0.85rem",
              padding: "0.85rem 1rem",
              background: colors.inputBg,
              color: colors.inputText,
              outline: "none",
              resize: "none",
              height: "95px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              border: `1px dashed ${colors.border}`,
              borderRadius: "1rem",
              padding: "1rem",
              background: isDark ? "#0b0f17" : "#fafafa",
              cursor: "pointer",
            }}
          >
            <strong style={{ color: colors.text }}>Upload photos</strong>

            <p
              style={{
                margin: "4px 0 0",
                color: colors.muted,
                fontSize: "0.85rem",
              }}
            >
              Add images to make your spot stand out.
            </p>

            <input
              type="file"
              multiple
              onChange={uploadImages}
              style={{
                display: "block",
                marginTop: "0.75rem",
                color: colors.muted,
              }}
            />
          </label>

          {uploadingImages && (
            <p style={{ color: colors.muted, fontSize: "0.9rem" }}>
              Uploading images...
            </p>
          )}

          {myImages.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: "0.6rem",
              }}
            >
              {myImages.map((url, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={url}
                    alt={`spot ${index + 1}`}
                    style={{
                      width: "100%",
                      height: 85,
                      objectFit: "cover",
                      borderRadius: "0.75rem",
                      border: `1px solid ${colors.border}`,
                    }}
                  />

                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      border: "none",
                      background: "rgba(0,0,0,0.65)",
                      color: "white",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || uploadingImages}
            style={{
              width: "100%",
              background: loading || uploadingImages ? "#9ca3af" : colors.danger,
              color: "white",
              border: "none",
              borderRadius: "9999px",
              padding: "0.9rem",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: loading || uploadingImages ? "not-allowed" : "pointer",
              marginTop: "0.3rem",
              boxShadow:
                loading || uploadingImages
                  ? "none"
                  : "0 10px 30px rgba(255,90,95,0.35)",
            }}
          >
            {loading ? "Publishing..." : "Create Spot"}
          </button>
        </div>
      </div>
    </div>
  );
};