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

/* ── captura clicks en el mapa y mueve el marcador ── */
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

export const SpotModal = ({ isOpen, onClose, onSpotCreated }) => {
  const { store } = useGlobalReducer();
  const [userPosition, setUserPosition] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [myImages, setMyImages] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);

  // la posición activa es la seleccionada manualmente o la del GPS
  const activePosition = selectedPosition || userPosition;

  /* ── animación ── */
  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [isOpen]);

  /* ── geolocalización ── */
  useEffect(() => {
    if (!isOpen) return;
    const watcher = navigator.geolocation.watchPosition((pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setUserPosition(coords);
      // solo usar GPS si el usuario no ha seleccionado manualmente
      setSelectedPosition((prev) => prev ?? null);
    });
    return () => navigator.geolocation.clearWatch(watcher);
  }, [isOpen]);

  /* ── Escape ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setNombre("");
      setDescripcion("");
      setMyImages([]);
      setSelectedPosition(null);
      onClose();
    }, 250);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const handleLocationSelect = (coords) => {
    setSelectedPosition(coords);
  };

  const resetLocation = () => {
    setSelectedPosition(null);
  };

  /* ── subir imágenes ── */
  const uploadImages = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/upload",
        { method: "POST", body: formData }
      );
      const url = await response.json();
      uploadedUrls.push(url);
    }
    setMyImages((prev) => [...prev, ...uploadedUrls]);
  };

  /* ── crear spot ── */
  const handleSubmit = async () => {
    if (!nombre.trim()) {
      alert("El nombre del spot es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/spots",
        {
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
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.msg || "Error al crear el spot");
        return;
      }

      onSpotCreated?.(data.spot);
      handleClose();
    } catch (err) {
      alert("Error de red al crear el spot");
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
        position: "fixed", inset: 0,
        backgroundColor: `rgba(0,0,0,${visible ? 0.55 : 0})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: "1rem",
        transition: "background-color 250ms ease",
      }}
    >
      <div
        style={{
          background: "white", borderRadius: "1.5rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          width: "100%", maxWidth: "680px", maxHeight: "90vh",
          overflowY: "auto", display: "flex", flexDirection: "column",
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          opacity: visible ? 1 : 0,
          transition: "transform 250ms cubic-bezier(0.34,1.3,0.64,1), opacity 250ms ease",
        }}
      >
        {/* cabecera */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0",
          position: "sticky", top: 0, background: "white", zIndex: 1,
          borderRadius: "1.5rem 1.5rem 0 0",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1a" }}>
              Crear Spot
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#888" }}>
              Publicando como <strong>{store.user?.nombre}</strong>
            </p>
          </div>
          <button onClick={handleClose} aria-label="Cerrar" style={{
            background: "#f5f5f5", border: "none", borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem", color: "#555", flexShrink: 0,
          }}>✕</button>
        </div>

        {/* mapa */}
        <div style={{ padding: "1rem 1.5rem 0" }}>
          {/* instrucción + botón reset */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "0.5rem",
          }}>
            <span style={{ fontSize: "0.8rem", color: "#888" }}>
              📍 Haz clic en el mapa para seleccionar una ubicación
            </span>
            {selectedPosition && (
              <button
                onClick={resetLocation}
                style={{
                  fontSize: "0.75rem", color: "#ff5a5f", background: "none",
                  border: "1px solid #ff5a5f", borderRadius: "6px",
                  padding: "2px 8px", cursor: "pointer",
                }}
              >
                Usar mi ubicación
              </button>
            )}
          </div>

          <div style={{ borderRadius: "1rem", overflow: "hidden", height: "clamp(200px, 35vh, 380px)" }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", cursor: "crosshair" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocationPicker onLocationSelect={handleLocationSelect} />

              {activePosition && (
                <Marker position={activePosition}>
                  <Popup>
                    {selectedPosition ? "Ubicación seleccionada" : "Tu ubicación"}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* coordenadas activas */}
          {activePosition && (
            <p style={{ fontSize: "0.75rem", color: "#aaa", margin: "0.4rem 0 0", textAlign: "right" }}>
              {activePosition[0].toFixed(5)}, {activePosition[1].toFixed(5)}
              {selectedPosition ? " · seleccionado" : " · GPS"}
            </p>
          )}
        </div>

        {/* formulario */}
        <div style={{ padding: "1rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <input
            type="text"
            placeholder="Nombre del spot"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{
              width: "100%", border: "1px solid #ddd", borderRadius: "0.75rem",
              padding: "0.75rem 1rem", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
            }}
          />

          <textarea
            placeholder="Describe este lugar..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{
              width: "100%", border: "1px solid #ddd", borderRadius: "0.75rem",
              padding: "0.75rem 1rem", fontSize: "0.95rem", outline: "none",
              resize: "none", height: "90px", boxSizing: "border-box",
            }}
          />

          <label>
            <span style={{ fontSize: "0.85rem", color: "#666" }}>Subir fotos</span>
            <input
              type="file" multiple onChange={uploadImages}
              style={{ display: "block", marginTop: "0.4rem", fontSize: "0.85rem", color: "#555" }}
            />
            {myImages.length > 0 && (
              <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {myImages.map((url, i) => (
                  <img key={i} src={url} alt={`foto ${i + 1}`}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "0.6rem", border: "1px solid #eee" }}
                  />
                ))}
              </div>
            )}
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", background: loading ? "#ccc" : "#ff5a5f",
              color: "white", border: "none", borderRadius: "9999px",
              padding: "0.85rem", fontSize: "1rem", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.25rem", transition: "opacity 150ms, transform 150ms",
            }}
          >
            {loading ? "Publicando..." : "Crear Spot"}
          </button>
        </div>
      </div>
    </div>
  );
};