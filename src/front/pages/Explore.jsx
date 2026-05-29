import { useEffect, useState } from "react";
import { Search, MapPin, Heart, Bookmark } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { SpotDetailsModal } from "../components/SpotDetailsModal";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const Explore = () => {
  const { store } = useGlobalReducer();

  const [spots, setSpots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpot, setSelectedSpot] = useState(null);

  const getSpots = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/spots", {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Error loading spots");
        return;
      }

      setSpots(data.spots || data);
    } catch (err) {
      setError("Network error loading spots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSpots();
  }, []);

  const updateSpotLike = (spotId, liked, likes) => {
    setSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === spotId ? { ...spot, liked, likes } : spot
      )
    );

    setSelectedSpot((prevSpot) =>
      prevSpot?.id === spotId ? { ...prevSpot, liked, likes } : prevSpot
    );
  };

  const toggleLike = async (spotId) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${spotId}/like`,
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

      updateSpotLike(spotId, data.liked, data.likes);
    } catch (err) {
      console.error("Network error liking spot", err);
    }
  };

  const categories = ["All", "Rooftop", "Coffee", "Murals", "Beach", "Studio", "Viewpoint"];

  const filteredSpots = spots.filter((spot) => {
    const title = spot.titulo || spot.title || "";
    const description = spot.descripcion || spot.description || "";
    const location = spot.location || spot.city || "";
    const category = spot.category || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search) ||
      location.toLowerCase().includes(search) ||
      category.toLowerCase().includes(search);

    const matchesCategory =
      activeCategory === "All" ||
      category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const spotsWithLocation = filteredSpots.filter(
    (spot) => spot.latitude && spot.longitude
  );

  const mapCenter =
    spotsWithLocation.length > 0
      ? [spotsWithLocation[0].latitude, spotsWithLocation[0].longitude]
      : [25.7617, -80.1918];

  return (
    <div className="spotly-dashboard">
      <DashboardSidebar />

      <main className="dashboard-main">
        <div className="explore-page">
          <div className="explore-header">
            <div>
              <h1>Explore Spots</h1>
              <p>Discover trending places, hidden gems and creative locations.</p>
            </div>

            <div className="explore-search">
              <Search size={20} />
              <input
                placeholder="Search spots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="explore-categories">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? "active" : ""}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {!loading && !error && spotsWithLocation.length > 0 && (
            <section className="explore-map-card">
              <MapContainer
                center={mapCenter}
                zoom={11}
                scrollWheelZoom={true}
                className="explore-map"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url={
                    store.theme === "dark"
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />

                {spotsWithLocation.map((spot) => (
                  <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
                    <Popup>
                      <div className="map-popup">
                        <strong>{spot.titulo || spot.title}</strong>
                        <p>{spot.descripcion || "No description available."}</p>
                        <button onClick={() => setSelectedSpot(spot)}>
                          View spot
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </section>
          )}

          {loading && (
            <div className="spot-post">
              <p>Loading spots...</p>
            </div>
          )}

          {error && (
            <div className="spot-post">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <section className="explore-grid">
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot) => {
                  const image =
                    spot.images?.[0] ||
                    spot.image ||
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700";

                  return (
                    <article className="explore-card" key={spot.id}>
                      <img src={image} alt={spot.titulo || "Spot"} />

                      <div className="explore-card-overlay">
                        <span>{spot.category || "Spot"}</span>

                        <button>
                          <Bookmark size={18} />
                        </button>
                      </div>

                      <div className="explore-card-content">
                        <h3>{spot.titulo || spot.title}</h3>

                        <p>
                          <MapPin size={16} />
                          {spot.location || "Location not specified"}
                        </p>

                        <div className="explore-card-footer">
                          <button
                            className="like-btn"
                            onClick={() => toggleLike(spot.id)}
                          >
                            <Heart
                              size={17}
                              fill={spot.liked ? "#ef3340" : "none"}
                              color={spot.liked ? "#ef3340" : "currentColor"}
                            />
                            {spot.likes || 0}
                          </button>

                          <button onClick={() => setSelectedSpot(spot)}>
                            View spot
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="spot-post">
                  <p>No spots found.</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <SpotDetailsModal
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
      />
    </div>
  );
};