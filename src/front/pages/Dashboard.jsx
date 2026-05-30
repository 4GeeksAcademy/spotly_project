import { MapPin, Heart, MessageCircle, Share2, Bookmark, Search, Bell, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { SpotModal } from "./SpotModal";

const ImageCarousel = ({ images, titulo }) => {
  const [current, setCurrent] = useState(0);

  if (images.length === 1) {
    return <img className="single-post-img" src={images[0]} alt={titulo} />;
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "12px" }}>
      <img
        src={images[current]}
        alt={`${titulo} ${current + 1}`}
        className="single-post-img"
        style={{ display: "block", width: "100%" }}
      />

      <button
        onClick={() => setCurrent((prev) => (prev - 1 + images.length) % images.length)}
        style={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.45)",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          cursor: "pointer",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft size={18} />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.45)",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          cursor: "pointer",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={18} />
      </button>

      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 5,
        }}
      >
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 18 : 7,
              height: 7,
              borderRadius: 4,
              background: i === current ? "#ff5a5f" : "rgba(255,255,255,0.6)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 200ms",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [showSpot, setShowSpot] = useState(false);
  const [spots, setSpots] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    fetchSpots();
    fetchUsers();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/spots",
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSpots(data);
      }
    } catch (err) {
      console.error("Error cargando spots:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/users",
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
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

      setSpots((prevSpots) =>
        prevSpots.map((spot) =>
          spot.id === spotId
            ? {
              ...spot,
              liked: data.liked,
              likes: data.likes,
            }
            : spot
        )
      );
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

      setSpots((prevSpots) =>
        prevSpots.map((spot) =>
          spot.id === spotId
            ? {
              ...spot,
              saved: data.saved,
              favorites: data.favorites,
            }
            : spot
        )
      );
    } catch (err) {
      console.error("Network error saving spot", err);
    }
  };

  const handleSpotCreated = (newSpot) => {
    setSpots((prev) => [newSpot, ...prev]);
  };

  const handleDelete = async (spotId) => {
    if (!confirm("¿Seguro que quieres eliminar este spot?")) return;

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${spotId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      if (response.ok) {
        setSpots((prev) => prev.filter((s) => s.id !== spotId));
      } else {
        const data = await response.json();
        alert(data.msg || "Error al eliminar");
      }
    } catch (err) {
      alert("Error de red al eliminar el spot");
    }
  };

  const timeAgo = (isoString) => {
    if (!isoString) return "";

    const diff = (Date.now() - new Date(isoString)) / 1000;

    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return `${Math.floor(diff / 86400)}d`;
  };

  const canDelete = (spot) =>
    Number(store.user?.id) === Number(spot.user.id) ||
    store.user?.tipo_usuario === "admin";

  const filteredSpots = spots.filter((spot) => {
    const search = activeSearch.toLowerCase();

    if (!search) return true;

    return (
      spot.user.nombre?.toLowerCase().includes(search) ||
      spot.user.apellido?.toLowerCase().includes(search) ||
      spot.titulo?.toLowerCase().includes(search) ||
      spot.descripcion?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="spotly-dashboard">
      <DashboardSidebar />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-search">
            <Search size={20} />

            <input
              placeholder="Search spots, places, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setActiveSearch(searchTerm);
              }}
            />

            <button
              className="search-btn"
              onClick={() => setActiveSearch(searchTerm)}
            >
              Search
            </button>
          </div>

          <div className="dashboard-user">
            <Bell size={22} />
            <img src="https://i.pravatar.cc/100?img=12" alt="User" />
            <div>
              <strong>
                {store.user?.nombre} {store.user?.apellido}
              </strong>
            </div>
          </div>
        </header>

        <section className="create-post-card">
          <div>
            <img src="https://i.pravatar.cc/100?img=12" alt="User" />
          </div>

          <div className="create-post-actions">
            <button onClick={() => setShowSpot(true)}>Post</button>
          </div>
        </section>

        <section className="feed">
          {spots.length === 0 && !activeSearch && (
            <div className="spot-post">
              <p style={{ textAlign: "center", color: "#aaa", padding: "1rem" }}>
                No spots yet. Be the first to post!
              </p>
            </div>
          )}

          {filteredSpots.length === 0 && activeSearch && (
            <div className="spot-post">
              <p>
                No spots found for: <strong>{activeSearch}</strong>
              </p>
            </div>
          )}

          {filteredSpots.map((spot) => (
            <article className="spot-post" key={spot.id}>
              <div className="post-header">
                <img
                  src={`https://i.pravatar.cc/100?u=${spot.user.id}`}
                  alt={spot.user.nombre}
                />

                <div>
                  <strong>
                    {spot.user.nombre} {spot.user.apellido}
                  </strong>
                  <p>{timeAgo(spot.created_at)}</p>
                </div>

                {canDelete(spot) && (
                  <button
                    onClick={() => handleDelete(spot.id)}
                    title="Eliminar spot"
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ccc",
                      padding: "4px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 150ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ff5a5f")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>

              <p className="post-text">{spot.descripcion}</p>

              {spot.latitude != null && spot.longitude != null && (
                <a
                  href={`https://www.google.com/maps?q=${spot.latitude},${spot.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem",
                    color: "#ff5a5f",
                    textDecoration: "none",
                    marginBottom: "0.5rem",
                  }}
                >
                  <MapPin size={14} />
                  {Number(spot.latitude).toFixed(5)},{" "}
                  {Number(spot.longitude).toFixed(5)}
                </a>
              )}

              {spot.images.length > 0 && (
                <ImageCarousel images={spot.images} titulo={spot.titulo} />
              )}

              <div className="post-actions">
                <button
                  className="like-btn"
                  onClick={() => toggleLike(spot.id)}
                >
                  <Heart
                    size={20}
                    fill={spot.liked ? "#ef3340" : "none"}
                    color={spot.liked ? "#ef3340" : "currentColor"}
                  />
                  {spot.likes || 0}
                </button>

                <span>
                  <MessageCircle size={20} /> 0
                </span>

                <span>
                  <Share2 size={20} /> 0
                </span>

                <button
                  className="like-btn"
                  onClick={() => toggleFavorite(spot.id)}
                >
                  <Bookmark
                    size={20}
                    fill={spot.saved ? "#ff5a5f" : "none"}
                    color={spot.saved ? "#ff5a5f" : "currentColor"}
                  />
                  {spot.favorites || 0}
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <aside className="dashboard-rightbar">
        <div className="right-card">
          <div className="card-title">
            <h3>Suggested for you</h3>
            <span>All</span>
          </div>

          {users.slice(0, 5).map((user) => (
            <div className="suggestion" key={user.id}>
              <img
                src={`https://i.pravatar.cc/100?u=${user.id}`}
                alt={user.nombre}
              />

              <div>
                <strong>
                  {user.nombre} {user.apellido}
                </strong>
                <p>Spotly user</p>
              </div>

              <button>Follow</button>
            </div>
          ))}

          {users.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: "#aaa", padding: "0.5rem 0" }}>
              No other users yet.
            </p>
          )}
        </div>

        <div className="right-card">
          <div className="card-title">
            <h3>Trending spots</h3>
            <span>See more...</span>
          </div>

          {["Rooftops", "Murals", "Parks", "Sports", "Beaches"].map((trend, index) => (
            <div className="trend" key={index}>
              <span>{index + 1}</span>

              <div>
                <strong>{trend}</strong>
                <p>{12 - index * 2}.4K posts</p>
              </div>
            </div>
          ))}
        </div>

        <div className="right-card">
          <div className="card-title">
            <h3>Spots map</h3>
            <span>Full map</span>
          </div>

          <div className="fake-map">
            <MapPin />
            <MapPin />
            <MapPin />
            <MapPin />
          </div>
        </div>
      </aside>

      <SpotModal
        isOpen={showSpot}
        onClose={() => setShowSpot(false)}
        onSpotCreated={handleSpotCreated}
      />
    </div>
  );
};