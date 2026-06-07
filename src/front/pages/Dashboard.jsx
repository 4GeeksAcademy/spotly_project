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
import toast from "react-hot-toast";
import { ConfirmModal } from "../components/confirmModal";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { SpotModal } from "./SpotModal";
import { CommentBox } from "../components/CommentBox";
import { FollowButton } from "../components/FollowButton";

const getAvatar = (user) =>
  user?.profile_image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || "Spotly User"
  )}&background=ef3340&color=fff`;

const normalizeImages = (images = []) =>
  images
    .map((img) => (typeof img === "string" ? img : img?.image_url))
    .filter(Boolean);

const ImageCarousel = ({ images = [], titulo }) => {
  const [current, setCurrent] = useState(0);
  const validImages = normalizeImages(images);

  if (validImages.length === 0) return null;

  if (validImages.length === 1) {
    return <img className="single-post-img" src={validImages[0]} alt={titulo} />;
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "12px" }}>
      <img
        src={validImages[current]}
        alt={`${titulo} ${current + 1}`}
        className="single-post-img"
        style={{ display: "block", width: "100%" }}
      />

      <button
        onClick={() =>
          setCurrent((prev) => (prev - 1 + validImages.length) % validImages.length)
        }
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
        onClick={() => setCurrent((prev) => (prev + 1) % validImages.length)}
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
        {validImages.map((_, i) => (
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

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [openComments, setOpenComments] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [copied, setCopied] = useState(false);

  const [followingIds, setFollowingIds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState(null);

  useEffect(() => {
    fetchSpots();
    fetchUsers();
    fetchNotifications();
    fetchFollowing();
  }, []);

  const toggleComments = (spotId) => {
    setOpenComments((prev) => ({ ...prev, [spotId]: !prev[spotId] }));
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/notifications",
        {
          headers: { Authorization: `Bearer ${store.token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotifications(data);
        setUnreadCount(data.filter((notification) => !notification.is_read).length);
      }
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/notifications/${notification.id}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${store.token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
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
    }
  };

const fetchFollowing = async () => {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "api/users/me/following",
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      }
    );

    const data = await response.json();

    const following = Array.isArray(data)
      ? data
      : data.following || [];

    setFollowingIds(following.map((user) => Number(user.id)));

  } catch (err) {
    console.error("Error cargando following:", err);
  }
};

  const fetchSpots = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/spots", {
        headers: { Authorization: `Bearer ${store.token}` },
      });

      const data = await response.json();


      if (response.ok) {
        setSpots(data.spots || data);
      }
    } catch (err) {
      console.error("Error cargando spots:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/users", {
        headers: { Authorization: `Bearer ${store.token}` },
      });

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
          headers: { Authorization: `Bearer ${store.token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) return;

      setSpots((prevSpots) =>
        prevSpots.map((spot) =>
          spot.id === spotId
            ? {
                ...spot,
                liked: data.liked,
                is_liked: data.liked,
                likes: data.likes,
                likes_count: data.likes,
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
          headers: { Authorization: `Bearer ${store.token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) return;

      setSpots((prevSpots) =>
        prevSpots.map((spot) =>
          spot.id === spotId
            ? {
                ...spot,
                saved: data.saved,
                is_favorite: data.saved,
                favorites: data.favorites,
                favorites_count: data.favorites,
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

  const openDeleteConfirm = (spotId) => {
    setSpotToDelete(spotId);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!spotToDelete) return;

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `api/spots/${spotToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${store.token}` },
        }
      );

      if (response.ok) {
        setSpots((prev) => prev.filter((spot) => spot.id !== spotToDelete));
        toast.success("Spot deleted");
        setShowConfirmDelete(false);
        setSpotToDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.msg || "Error deleting spot");
      }
    } catch (err) {
      toast.error("Network error deleting spot");
    }
  };

  const handleFollowToggle = async (targetUserId) => {
    if (!store.token) {
      toast.error("You must be logged in to follow users");
      return;
    }

    setLoadingId(targetUserId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/users/${targetUserId}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.is_following) {
          setFollowingIds((prev) =>
            prev.includes(Number(targetUserId)) ? prev : [...prev, Number(targetUserId)]
          );
        } else {
          setFollowingIds((prev) =>
            prev.filter((id) => Number(id) !== Number(targetUserId))
          );
        }
      } else {
        toast.error(data.msg || "Error updating follow");
      }
    } catch (error) {
      toast.error("Network error following user");
    } finally {
      setLoadingId(null);
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
      toast.success("Link copied");
    } catch (error) {
      toast.error("Could not copy link");
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
      email: `mailto:?subject=${encodeURIComponent(
        selectedSpot.titulo
      )}&body=${text}%0A%0A${spotUrl}`,
      instagram: "https://www.instagram.com/",
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer");
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
    Number(store.user?.id) === Number(spot.user?.id) ||
    store.user?.tipo_usuario === "admin";

  const filteredSpots = spots.filter((spot) => {
    const search = activeSearch.toLowerCase();

    if (!search) return true;

    return (
      spot.user?.nombre?.toLowerCase().includes(search) ||
      spot.user?.apellido?.toLowerCase().includes(search) ||
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

            <button className="search-btn" onClick={() => setActiveSearch(searchTerm)}>
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
                  <span className="topbar-notification-badge">{unreadCount}</span>
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
                        className={`notifications-dropdown-item ${
                          notification.is_read ? "read" : "unread"
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

            <img
              src={getAvatar(store.user)}
              alt="User"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            />

            <div onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
              <strong>
                {store.user?.nombre} {store.user?.apellido}
              </strong>
            </div>
          </div>
        </header>

        <section className="create-post-card">
          <div onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
            <img src={getAvatar(store.user)} alt="User" />
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
                  src={getAvatar(spot.user)}
                  alt={spot.user?.nombre || "User"}
                  onClick={() => spot.user?.id && navigate(`/profile/${spot.user.id}`)}
                  style={{ cursor: spot.user?.id ? "pointer" : "default" }}
                />

                <div
                  onClick={() => spot.user?.id && navigate(`/profile/${spot.user.id}`)}
                  style={{ cursor: spot.user?.id ? "pointer" : "default" }}
                >
                  <strong>
                    {spot.user?.nombre} {spot.user?.apellido}
                  </strong>
                  <p>{timeAgo(spot.created_at)}</p>
                </div>

                {canDelete(spot) && (
                  <button
                    onClick={() => openDeleteConfirm(spot.id)}
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

              {spot.titulo && <h3 className="post-title">{spot.titulo}</h3>}

              {spot.descripcion && <p className="post-text">{spot.descripcion}</p>}

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

              <ImageCarousel images={spot.images || []} titulo={spot.titulo} />

              <div className="post-actions">
                <button className="like-btn" onClick={() => toggleLike(spot.id)}>
                  <Heart
                    size={20}
                    fill={spot.liked || spot.is_liked ? "#ef3340" : "none"}
                    color={spot.liked || spot.is_liked ? "#ef3340" : "currentColor"}
                  />
                  {spot.likes_count ?? spot.likes ?? 0}
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

                <button className="like-btn" onClick={() => openShareModal(spot)}>
                  <Share2 size={20} />
                </button>

                <button className="like-btn" onClick={() => toggleFavorite(spot.id)}>
                  <Bookmark
                    size={20}
                    fill={spot.saved || spot.is_favorite ? "#ff5a5f" : "none"}
                    color={
                      spot.saved || spot.is_favorite ? "#ff5a5f" : "currentColor"
                    }
                  />
                  {spot.favorites_count ?? spot.favorites ?? 0}
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
                src={getAvatar(user)}
                alt={user.nombre || "User"}
                onClick={() => navigate(`/profile/${user.id}`)}
                style={{ cursor: "pointer" }}
              />

              <div
                onClick={() => navigate(`/profile/${user.id}`)}
                style={{ cursor: "pointer", flex: 1 }}
              >
                <strong>
                  {user.nombre} {user.apellido}
                </strong>
                <p>Spotly user</p>
              </div>

              <FollowButton
                userId={user.id}
                isFollowing={followingIds.includes(Number(user.id))}
                isLoading={Number(loadingId) === Number(user.id)}
                onToggle={handleFollowToggle}
              />
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

      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Delete spot?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowConfirmDelete(false);
          setSpotToDelete(null);
        }}
      />

      <SpotModal
        isOpen={showSpot}
        onClose={() => setShowSpot(false)}
        onSpotCreated={handleSpotCreated}
      />
    </div>
  );
};