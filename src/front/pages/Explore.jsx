import { useEffect, useState } from "react";
import { Search, MapPin, Heart, Bookmark } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { SpotDetailsModal } from "../components/SpotDetailsModal";
import { LocationSearch } from "../components/LocationSearch";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const FlyToLocation = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);

  return null;
};


const ExploreSkeleton = () => (
  <>
    <section className="explore-map-card explore-map-skeleton-card">
      <div style={{ padding: "1rem" }}>
        <div className="skeleton skeleton-line full" style={{ height: 42 }} />
      </div>

      <div className="skeleton explore-map-skeleton" />
    </section>

    <section className="explore-grid">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <article className="explore-card" key={item}>
          <div className="skeleton explore-card-image-skeleton" />

          <div className="explore-card-content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                className="skeleton skeleton-avatar"
                style={{ width: 32, height: 32 }}
              />
              <div className="skeleton skeleton-line short" />
            </div>

            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line medium" />

            <div className="skeleton-actions">
              <div className="skeleton skeleton-pill" />
              <div className="skeleton skeleton-pill" />
              <div className="skeleton skeleton-pill" />
            </div>
          </div>
        </article>
      ))}
    </section>
  </>
);


const getSpotImage = (spot) => {
  const firstImage = spot.images?.[0];

  if (typeof firstImage === "string") return firstImage;
  if (firstImage?.image_url) return firstImage.image_url;

  return spot.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700";
};

const getUserAvatar = (user) =>
  user?.profile_image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || "Spotly User"
  )}&background=ef3340&color=fff`;

export const Explore = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [spots, setSpots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mapCenter, setMapCenter] = useState([25.7617, -80.1918]);
  const [searchedLocation, setSearchedLocation] = useState("");

  const isDark = store.theme === "dark";

  const getSpots = async () => {
    try {
      setLoading(true);
      setError("");

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

      const loadedSpots = data.spots || data;
      setSpots(Array.isArray(loadedSpots) ? loadedSpots : []);

      const firstSpotWithLocation = loadedSpots.find(
        (spot) => spot.latitude != null && spot.longitude != null
      );

      if (firstSpotWithLocation) {
        setMapCenter([
          Number(firstSpotWithLocation.latitude),
          Number(firstSpotWithLocation.longitude),
        ]);
      }
    } catch (err) {
      console.error("Network error loading spots", err);
      setError("Network error loading spots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store.token) {
      getSpots();
    }
  }, [store.token]);

  const handleLocationSearch = ([lat, lng, displayName]) => {
    setMapCenter([lat, lng]);
    setSearchedLocation(displayName || "Selected location");
  };

  const updateSpotLike = (spotId, liked, likes) => {
    setSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === spotId
          ? {
              ...spot,
              liked,
              is_liked: liked,
              likes,
              likes_count: likes,
            }
          : spot
      )
    );

    setSelectedSpot((prevSpot) =>
      prevSpot?.id === spotId
        ? {
            ...prevSpot,
            liked,
            is_liked: liked,
            likes,
            likes_count: likes,
          }
        : prevSpot
    );
  };

  const updateSpotFavorite = (spotId, saved, favorites) => {
    setSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === spotId
          ? {
              ...spot,
              saved,
              is_favorite: saved,
              favorites,
              favorites_count: favorites,
            }
          : spot
      )
    );

    setSelectedSpot((prevSpot) =>
      prevSpot?.id === spotId
        ? {
            ...prevSpot,
            saved,
            is_favorite: saved,
            favorites,
            favorites_count: favorites,
          }
        : prevSpot
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

  const toggleFavorite = async (spotId) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${spotId}/favorite`,
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

      updateSpotFavorite(spotId, data.saved, data.favorites);
    } catch (err) {
      console.error("Network error saving spot", err);
    }
  };

  const openUserProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const categories = [
    "All",
    "Rooftop",
    "Coffee",
    "Murals",
    "Beach",
    "Studio",
    "Viewpoint",
  ];

  const filteredSpots = spots.filter((spot) => {
    const title = spot.titulo || spot.title || "";
    const description = spot.descripcion || spot.description || "";
    const location = spot.location || spot.city || "";
    const category = spot.category?.nombre || spot.category || "";
    const userName = `${spot.user?.nombre || ""} ${spot.user?.apellido || ""}`;
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      title.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search) ||
      location.toLowerCase().includes(search) ||
      category.toLowerCase().includes(search) ||
      userName.toLowerCase().includes(search);

    const matchesCategory =
      activeCategory === "All" ||
      category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const spotsWithLocation = filteredSpots.filter(
    (spot) => spot.latitude != null && spot.longitude != null
  );

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
                placeholder="Search spots, users or places..."
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

          {!loading && !error && (
            <section className="explore-map-card">
              <div style={{ padding: "1rem 1rem 0" }}>
                <LocationSearch
                  onLocationSelect={handleLocationSearch}
                  isDark={isDark}
                />

                {searchedLocation && (
                  <p
                    style={{
                      margin: "0 0 0.75rem",
                      fontSize: "0.85rem",
                      color: isDark ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    Map focused on: {searchedLocation}
                  </p>
                )}
              </div>

              <MapContainer
                center={mapCenter}
                zoom={11}
                scrollWheelZoom={true}
                className="explore-map"
              >
                <FlyToLocation center={mapCenter} />

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url={
                    isDark
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />

                {spotsWithLocation.map((spot) => (
                  <Marker
                    key={spot.id}
                    position={[Number(spot.latitude), Number(spot.longitude)]}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>{spot.titulo || spot.title}</strong>
                        <p>{spot.descripcion || "No description available."}</p>

                        {spot.user && (
                          <button onClick={() => openUserProfile(spot.user.id)}>
                            View profile
                          </button>
                        )}

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

          {loading && <ExploreSkeleton />}

          {error && (
            <div className="spot-post">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <section className="explore-grid">
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot) => {
                  const image = getSpotImage(spot);
                  const liked = spot.liked || spot.is_liked;
                  const saved = spot.saved || spot.is_favorite;
                  const likesCount = spot.likes_count ?? spot.likes ?? 0;
                  const favoritesCount = spot.favorites_count ?? spot.favorites ?? 0;
                  const category = spot.category?.nombre || spot.category || "Spot";

                  return (
                    <article className="explore-card" key={spot.id}>
                      <img
                        src={image}
                        alt={spot.titulo || "Spot"}
                        onClick={() => setSelectedSpot(spot)}
                        style={{ cursor: "pointer" }}
                      />

                      <div className="explore-card-overlay">
                        <span>{category}</span>

                        <button
                          onClick={() => toggleFavorite(spot.id)}
                          title={saved ? "Remove from saved" : "Save spot"}
                        >
                          <Bookmark
                            size={18}
                            fill={saved ? "#ef3340" : "none"}
                            color={saved ? "#ef3340" : "currentColor"}
                          />
                        </button>
                      </div>

                      <div className="explore-card-content">
                        <div
                          onClick={() => spot.user?.id && openUserProfile(spot.user.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.55rem",
                            cursor: spot.user?.id ? "pointer" : "default",
                            marginBottom: "0.65rem",
                          }}
                        >
                          <img
                            src={getUserAvatar(spot.user)}
                            alt={spot.user?.nombre || "User"}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <strong style={{ fontSize: "0.9rem" }}>
                            {spot.user?.nombre} {spot.user?.apellido}
                          </strong>
                        </div>

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
                              fill={liked ? "#ef3340" : "none"}
                              color={liked ? "#ef3340" : "currentColor"}
                            />
                            {likesCount}
                          </button>

                          <button
                            className="like-btn"
                            onClick={() => toggleFavorite(spot.id)}
                          >
                            <Bookmark
                              size={17}
                              fill={saved ? "#ef3340" : "none"}
                              color={saved ? "#ef3340" : "currentColor"}
                            />
                            {favoritesCount}
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

