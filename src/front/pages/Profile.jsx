import {
  Settings,
  Grid3X3,
  Bookmark,
  BadgeCheck,
  Ellipsis
} from "lucide-react";

import { DashboardSidebar } from "../components/DashboardSidebar";
import { FollowButton } from "../components/FollowButton";
import "../components/userProfile.css";
import { useEffect, useState, useMemo } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, useParams } from "react-router-dom";


export const Profile = () => {
  const { store, dispatch } = useGlobalReducer(); // ← dispatch añadido
  const navigate = useNavigate();
  const { userId } = useParams();


  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);
  const [spots, setSpots] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [targetUser, setTargetUser] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [userData, setUserData] = useState({
    username: "",
    bio: "✨ Exploring new places & capturing moments",
    location: "📍 Digital nomad"
  });

  // ── fetches ──────────────────────────────────────────────

  const fetchTargetUser = async (ownProfile, tUserId) => {
    if (isOwnProfile) {
      setTargetUser(store.user);
      setUserData((prev) => ({
        ...prev,
        username: `${store.user?.nombre || ""} ${store.user?.apellido || ""}`.trim(),
      }));
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/users/${tUserId}`,
        { headers: { Authorization: `Bearer ${store.token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setTargetUser(data);
        setUserData((prev) => ({
          ...prev,
          username: `${data.nombre || ""} ${data.apellido || ""}`.trim(),
        }));
      }
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  const fetchSpots = async () => {
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/spots",
        { headers: { Authorization: `Bearer ${store.token}` } }
      );
      const data = await res.json();
      if (res.ok) setSpots(data.spots || data);
    } catch (err) {
      console.error("Error loading spots:", err);
    }
  };

  const fetchFollowers = async (ownProfile, tUserId) => {
    // Si es perfil ajeno, pedimos los followers de ese usuario
    const endpoint = isOwnProfile
      ? "api/users/me/followers"
      : `api/users/${tUserId}/followers`;
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + endpoint,
        { headers: { Authorization: `Bearer ${store.token}` } }
      );
      const data = await res.json();
      if (res.ok) setFollowersCount(data.count);
    } catch (err) {
      console.error("Error cargando followers:", err);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/users/me/following",
        { headers: { Authorization: `Bearer ${store.token}` } }
      );
      const data = await res.json();
      if (res.ok) setFollowingIds(data.map((u) => u.id));
    } catch (err) {
      console.error("Error cargando following:", err);
    }
  };

  const handleFollowToggle = async (targetId) => {
    setLoadingId(targetId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/users/${targetId}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        if (data.is_following) {
          setFollowingIds((prev) => [...prev, targetId]);
          setFollowersCount((prev) => prev + 1);
        } else {
          setFollowingIds((prev) => prev.filter((id) => id !== targetId));
          setFollowersCount((prev) => Math.max(prev - 1, 0));
        }
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const isOwnProfile = useMemo(
    () => !userId || Number(userId) === Number(store.user?.id),
    [userId, store.user?.id]
  );

  const targetUserId = useMemo(
    () => userId || store.user?.id,
    [userId, store.user?.id]
  );

  useEffect(() => {
    fetchTargetUser(isOwnProfile, targetUserId);
    fetchSpots();
    fetchFollowers(isOwnProfile, targetUserId);
    if (!isOwnProfile) fetchFollowing();
  }, [userId, store.user?.id]);

  // ── derived data ─────────────────────────────────────────

  const myPosts = spots.filter(
    (spot) => Number(spot.user?.id) === Number(targetUserId)
  );
  const savedPosts = spots.filter((spot) => spot.saved);
  const visiblePosts = activeTab === "saved" ? savedPosts : myPosts;
  const totalLikes = myPosts.reduce((t, s) => t + (s.likes || 0), 0);
  const totalSaved = myPosts.reduce((t, s) => t + (s.favorites || 0), 0);

  // ── render ────────────────────────────────────────────────

  return (
    <div className="spotly-dashboard">
      <DashboardSidebar />

      <main className="dashboard-main">
        <div className="profile-page">
          <section className="profile-header">
            <div className="profile-avatar">
              <img
                src={`https://i.pravatar.cc/300?u=${targetUserId}`}
                alt="profile"
              />
            </div>

            <div className="profile-info">

              <div className="profile-top">

                {isOwnProfile && editing ? (
                  <input
                    className="edit-input"
                    value={userData.username}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        username: e.target.value
                      })
                    }
                  />
                ) : (
                  <h2>
                    {userData.username || "Spotly User"}
                    <BadgeCheck
                      size={22}
                      fill="#ff4d67"
                      color="#ff4d67"
                    />
                  </h2>
                )}

                {isOwnProfile ? (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => setEditing(!editing)}
                    >
                      {editing ? "Save Profile" : "Edit Profile"}
                    </button>

                    <div className="settings-container">
                      <button
                        className="settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                      >
                        <Settings size={22} />
                        <span>Settings</span>
                      </button>

                      {showSettings && (
                        <div className="settings-menu">

                          <label className="settings-option">
                            Change Photo

                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files[0];

                                if (file) {
                                  setProfileImage(URL.createObjectURL(file));
                                }

                                setShowSettings(false);
                              }}
                            />
                          </label>

                          <button
                            className="settings-option logout-option"
                            onClick={() => {
                              dispatch({ type: "logout" });
                              navigate("/");
                            }}
                          >
                            Log Out
                          </button>

                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <FollowButton
                    userId={Number(targetUserId)}
                    isFollowing={followingIds.includes(Number(targetUserId))}
                    isLoading={loadingId === Number(targetUserId)}
                    onToggle={handleFollowToggle}
                  />
                )}

              </div>

              <div className="profile-stats">
                <span><strong>{myPosts.length}</strong> posts</span>
                <span><strong>{followersCount}</strong> followers</span>
                <span><strong>{totalLikes}</strong> likes</span>
                <span><strong>{totalSaved}</strong> saves</span>
              </div>

              <div className="profile-bio">
                {isOwnProfile && editing ? (
                  <>
                    <input
                      className="edit-input"
                      value={userData.location}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          location: e.target.value
                        })
                      }
                    />

                    <textarea
                      className="edit-textarea"
                      value={userData.bio}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          bio: e.target.value
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <p>{userData.location}</p>
                    <p>{userData.bio}</p>
                    <p>📸 Coffee lover | Adventure seeker</p>
                  </>
                )}
              </div>

            </div>
          </section>


          <section className="profile-tabs">
            <button
              className={activeTab === "posts" ? "active" : ""}
              onClick={() => setActiveTab("posts")}
            >
              <Grid3X3 size={18} /> POSTS
            </button>

            {/* Tab "Saved" solo visible en perfil propio */}
            {isOwnProfile && (
              <button
                className={activeTab === "saved" ? "active" : ""}
                onClick={() => setActiveTab("saved")}
              >
                <Bookmark size={18} /> SAVED
              </button>
            )}
          </section>

          <section className="profile-posts">
            {visiblePosts.length > 0 ? (
              visiblePosts.map((spot) => {
                const image =
                  spot.images?.[0] ||
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900";
                return (
                  <div className="profile-post" key={spot.id}>
                    <img src={image} alt={spot.titulo || "post"} />
                    <button className="post-menu">
                      <Ellipsis size={20} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="spot-post">
                <p>
                  {activeTab === "saved"
                    ? "No saved spots yet."
                    : "No posts yet."}
                </p>
              </div>
            )}
          </section>
        </div >
      </main >
    </div >
  );
};