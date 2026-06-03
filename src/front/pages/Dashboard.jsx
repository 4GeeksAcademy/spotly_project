import {
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Search,
  Bell,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Mail,
  Send,
  Globe,
} from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { SpotModal } from "./SpotModal";
import { CommentBox } from "../components/CommentBox";
import { ConfirmModal } from "../components/ConfirmModal";

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
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [showSpot, setShowSpot] = useState(false);
  const [spots, setSpots] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [openComments, setOpenComments] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [copied, setCopied] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState(null);

  const showToast = (message, type = "success") => {
    dispatch({
      type: "show_toast",
      payload: { message, type },
    });
  };

  const toggleComments = (spotId) => {
    setOpenComments((prev) => ({ ...prev, [spotId]: !prev[spotId] }));
  };

  useEffect(() => {
    fetchSpots();
    fetchUsers();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/notifications",
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotifications(data);
        setUnreadCount(data.filter((notification) => !notification.is_read).length);
      } else {
        showToast(data.msg || "Error loading notifications", "error");
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      showToast("Network error loading notifications", "error");
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/notifications/${notification.id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      if (!response.ok) {
        showToast("Could not open notification", "error");
        return;
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount((prev) =>
        notification.is_read ? prev : Math.max(prev - 1, 0)
      );

      setShowNotifications(false);

      if (notification.spot_id) {
        navigate(`/single/${notification.spot_id}`);
      }
    } catch (error) {
      console.error("Error opening notification:", error);
      showToast("Error opening notification", "error");
    }
  };

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
      } else {
        showToast(data.msg || "Error loading spots", "error");
      }
    } catch (err) {
      console.error("Error loading spots:", err);
      showToast("Network error loading spots", "error");
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
      } else {
        showToast(data.msg || "Error loading users", "error");
      }
    } catch (err) {
      console.error("Error loading users:", err);
      showToast("Network error loading users", "error");
    }
  };

  const getSpotUrl = (spotId) => `${window.location.origin}/single/${spotId}`;

  const getShareText = (spot) => {
    return `Check out this Spotly spot: ${spot?.titulo || "Spot"}`;
  };

  const openShareModal = (spot) => {
    setSelectedSpot(spot);
    setCopied(false);
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedSpot(null);
    setCopied(false);
  };

  const copySpotLink = async () => {
    if (!selectedSpot) return;

    try {
      await navigator.clipboard.writeText(getSpotUrl(selectedSpot.id));
      setCopied(true);
      showToast("Link copied!", "success");
    } catch (error) {
      console.error("Error copying link:", error);
      showToast("Could not copy link", "error");
    }
  };

  const nativeShareSpot = async () => {
    if (!selectedSpot) return;

    const spotUrl = getSpotUrl(selectedSpot.id);
    const text = getShareText(selectedSpot);

    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedSpot.titulo,
          text,
          url: spotUrl,
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
    if (!selectedSpot) return;

    const spotUrl = encodeURIComponent(getSpotUrl(selectedSpot.id));
    const text = encodeURIComponent(getShareText(selectedSpot));

    const urls = {
      whatsapp: `https://wa.me/?text=${text}%20${spotUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${spotUrl}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${spotUrl}`,
      telegram: `https://t.me/share/url?url=${spotUrl}&text=${text}`,
      email: `mailto:?subject=${encodeURIComponent(selectedSpot.titulo)}&body=${text}%0A%0A${spotUrl}`,
      instagram: `https://www.instagram.com/`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer");
    showToast(`Opening ${platform}...`, "info");
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
        showToast(data.msg || "Error liking spot", "error");
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

      showToast(data.liked ? "Spot liked!" : "Like removed", "success");
    } catch (err) {
      console.error("Network error liking spot", err);
      showToast("Network error liking spot", "error");
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
        showToast(data.msg || "Error saving spot", "error");
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

      showToast(data.saved ? "Spot saved!" : "Spot removed from saved", "success");
    } catch (err) {
      console.error("Network error saving spot", err);
      showToast("Network error saving spot", "error");
    }
  };

  const handleSpotCreated = (newSpot) => {
    setSpots((prev) => [newSpot, ...prev]);
    showToast("Spot created!", "success");
  };

  const handleDelete = (spot) => {
    setSpotToDelete(spot);
  };

  const confirmDeleteSpot = async () => {
    if (!spotToDelete) return;

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${spotToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      if (response.ok) {
        setSpots((prev) => prev.filter((s) => s.id !== spotToDelete.id));
        showToast("Spot deleted!", "success");
        setSpotToDelete(null);
      } else {
        const data = await response.json();
        showToast(data.msg || "Error deleting spot", "error");
      }
    } catch (err) {
      console.error("Network error deleting spot:", err);
      showToast("Network error deleting spot", "error");
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
            <div className="topbar-notifications">
              <button
                className="topbar-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={22} />

                {unreadCount > 0 && (
                  <span className="topbar-notification-badge">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-dropdown-header">
                    <strong>Notifications</strong>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="notifications-dropdown-empty">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`notifications-dropdown-item ${notification.is_read ? "read" : "unread"
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                        style={{ cursor: "pointer" }}
                      >
                        <p>{notification.message}</p>
                        <span>
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString()
                            : "Recently"}
                        </span>
                      </div>
                    ))
                  )}

                  {notifications.length > 5 && (
                    <button
                      className="notifications-view-more"
                      onClick={() => navigate("/notifications")}
                    >
                      See all...
                    </button>
                  )}
                </div>
              )}
            </div>

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
                    onClick={() => handleDelete(spot)}
                    title="Delete spot"
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

                <button
                  onClick={() => toggleComments(spot.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    color: "inherit",
                    padding: 0,
                  }}
                >
                  <MessageCircle size={20} />
                </button>

                <button
                  className="like-btn"
                  onClick={() => openShareModal(spot)}
                >
                  <Share2 size={20} />
                </button>

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

              {openComments[spot.id] && (
                <CommentBox spotId={spot.id} token={store.token} />
              )}
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

          {["Rooftops", "Murals", "Parks", "Sports", "Beaches"].map(
            (trend, index) => (
              <div className="trend" key={index}>
                <span>{index + 1}</span>

                <div>
                  <strong>{trend}</strong>
                  <p>{12 - index * 2}.4K posts</p>
                </div>
              </div>
            )
          )}
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

      {showShareModal && selectedSpot && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <div>
                <h3>Share spot</h3>
                <p>{selectedSpot.titulo}</p>
              </div>

              <button onClick={closeShareModal}>
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

      <SpotModal
        isOpen={showSpot}
        onClose={() => setShowSpot(false)}
        onSpotCreated={handleSpotCreated}
      />
      <ConfirmModal
        isOpen={!!spotToDelete}
        title="Delete spot?"
        message={`Are you sure you want to delete "${spotToDelete?.titulo}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
        onCancel={() => setSpotToDelete(null)}
        onConfirm={confirmDeleteSpot}
      />
    </div>
  );
};