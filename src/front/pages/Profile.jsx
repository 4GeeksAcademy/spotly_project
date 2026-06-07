import {
  Settings,
  Grid3X3,
  Bookmark,
  BadgeCheck,
  Ellipsis,
  MapPin,
  Image,
  Heart,
  Users,
  UserPlus,
} from "lucide-react";

import { DashboardSidebar } from "../components/DashboardSidebar";
import { FollowButton } from "../components/FollowButton";
import { FollowModal } from "../components/FollowModal";
import { SpotDetailsModal } from "../components/SpotDetailsModal";
import "../components/userProfile.css";
import { useEffect, useState, useMemo } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const getUserAvatar = (user, fallbackName = "Spotly User") =>
  user?.profile_image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || fallbackName
  )}&background=ef3340&color=fff`;

const getSpotImage = (spot) =>
  spot.images?.[0]?.image_url ||
  spot.images?.[0] ||
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900";

const ProfileSkeleton = () => (
  <div className="profile-page">
    <section className="profile-header profile-header--skeleton">
      <div className="profile-skeleton-avatar skeleton" />

      <div className="profile-skeleton-info">
        <div className="skeleton skeleton-line skeleton-title" />
        <div className="profile-stat-cards">
          {[1, 2, 3, 4, 5].map((item) => (
            <div className="profile-stat-card" key={item}>
              <div className="skeleton skeleton-number" />
              <div className="skeleton skeleton-label" />
            </div>
          ))}
        </div>
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </section>

    <section className="profile-tabs profile-tabs--skeleton">
      <div className="skeleton skeleton-tab" />
      <div className="skeleton skeleton-tab" />
    </section>

    <section className="profile-posts">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="profile-post profile-post--skeleton skeleton" key={item} />
      ))}
    </section>
  </div>
);

export const Profile = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);
  const [spots, setSpots] = useState([]);
  const [savedSpots, setSavedSpots] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [targetUser, setTargetUser] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_spots: 0,
    total_likes: 0,
    total_favorites: 0,
    is_following: false,
  });

  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");
  const [followModalUsers, setFollowModalUsers] = useState([]);

  const [userData, setUserData] = useState({
    username: "",
    bio: "✨ Exploring new places & capturing moments",
    location: "📍 Digital nomad",
  });

  const isOwnProfile = useMemo(
    () => !userId || Number(userId) === Number(store.user?.id),
    [userId, store.user?.id]
  );

  const targetUserId = useMemo(
    () => userId || store.user?.id,
    [userId, store.user?.id]
  );

  const getAvatarUrl = () =>
    targetUser?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData.username || "Spotly User"
    )}&background=ef3340&color=fff`;

  const normalizeUsersResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.followers)) return data.followers;
    if (Array.isArray(data.following)) return data.following;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    return [];
  };

  const fetchPublicProfile = async () => {
    if (!targetUserId || !store.token) return;

    try {
      setProfileLoading(true);
      setPostsLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/users/${targetUserId}/public-profile`,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || "Error loading profile");
        return;
      }

      setTargetUser(data.user);
      setSpots(data.spots || []);
      setFollowersCount(data.stats?.followers || 0);
      setFollowingCount(data.stats?.following || 0);
      setStats(data.stats || {});

      setUserData((prev) => ({
        ...prev,
        username: `${data.user?.nombre || ""} ${data.user?.apellido || ""}`.trim(),
      }));

      if (data.stats?.is_following) {
        setFollowingIds((prev) =>
          prev.includes(Number(targetUserId)) ? prev : [...prev, Number(targetUserId)]
        );
      }
    } catch (err) {
      console.error("Error loading public profile:", err);
      toast.error("Error loading profile");
    } finally {
      setProfileLoading(false);
      setPostsLoading(false);
    }
  };

  const fetchSavedSpots = async () => {
    if (!isOwnProfile || !store.token) return;

    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "api/spots", {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const allSpots = Array.isArray(data) ? data : data.spots || [];
        setSavedSpots(allSpots.filter((spot) => spot.saved || spot.is_favorite));
      }
    } catch (err) {
      console.error("Error loading saved spots:", err);
    }
  };

  const fetchMyFollowing = async () => {
    if (!store.token) return;

    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/users/me/following",
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        const users = normalizeUsersResponse(data);
        setFollowingIds(users.map((u) => Number(u.id)));
      }
    } catch (err) {
      console.error("Error cargando following:", err);
    }
  };

  const openFollowModal = async (type) => {
    if (!targetUserId) return;

    setFollowModalType(type);
    setFollowModalOpen(true);
    setFollowModalUsers([]);

    const endpoint =
      type === "followers"
        ? isOwnProfile
          ? "api/users/me/followers"
          : `api/users/${targetUserId}/followers`
        : isOwnProfile
        ? "api/users/me/following"
        : `api/users/${targetUserId}/following`;

    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + endpoint, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setFollowModalUsers(normalizeUsersResponse(data));
      } else {
        toast.error(data.msg || "Error loading users");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading users");
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
          setFollowingIds((prev) =>
            prev.includes(Number(targetId)) ? prev : [...prev, Number(targetId)]
          );

          if (Number(targetId) === Number(targetUserId)) {
            setFollowersCount((prev) => prev + 1);
            setStats((prev) => ({ ...prev, is_following: true }));
          }

          toast.success("Following user");
        } else {
          setFollowingIds((prev) =>
            prev.filter((id) => Number(id) !== Number(targetId))
          );

          if (Number(targetId) === Number(targetUserId)) {
            setFollowersCount((prev) => Math.max(prev - 1, 0));
            setStats((prev) => ({ ...prev, is_following: false }));
          }

          if (followModalType === "following" && isOwnProfile) {
            setFollowModalUsers((prev) =>
              prev.filter((user) => Number(user.id) !== Number(targetId))
            );
          }

          toast.success("Unfollowed user");
        }
      } else {
        toast.error(data.msg || "Error updating follow");
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error("Error updating follow");
    } finally {
      setLoadingId(null);
    }
  };

  const uploadProfileImage = async (file) => {
    if (!file) return;

    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const imageUrl = await uploadResponse.json();

      if (!uploadResponse.ok) {
        toast.error("Error uploading image");
        return;
      }

      const saveResponse = await fetch(
        import.meta.env.VITE_BACKEND_URL + "api/profile/avatar",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify({
            profile_image: imageUrl,
          }),
        }
      );

      const updatedUser = await saveResponse.json();

      if (!saveResponse.ok) {
        toast.error(updatedUser.msg || "Error updating profile photo");
        return;
      }

      dispatch({
        type: "set_user",
        payload: updatedUser,
      });

      setTargetUser(updatedUser);
      toast.success("Profile photo updated");
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    fetchPublicProfile();
    fetchMyFollowing();
    fetchSavedSpots();
  }, [userId, store.user?.id, store.user?.profile_image, store.token]);

  const visiblePosts = activeTab === "saved" ? savedSpots : spots;

  if (profileLoading) {
    return (
      <div className="spotly-dashboard">
        <DashboardSidebar />
        <main className="dashboard-main">
          <ProfileSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="spotly-dashboard">
      <DashboardSidebar />

      <main className="dashboard-main">
        <div className="profile-page">
          <section className="profile-header">
            <div className="profile-cover-glow" />

            <div className="profile-avatar-card">
              <div className="profile-avatar">
                <img src={getAvatarUrl()} alt="profile" />
              </div>

              {isOwnProfile && editing && (
                <label className="change-photo-btn">
                  {uploadingPhoto ? "Uploading..." : "Change Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploadingPhoto}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      uploadProfileImage(file);
                    }}
                  />
                </label>
              )}
            </div>

            <div className="profile-info">
              <div className="profile-top">
                {isOwnProfile && editing ? (
                  <input
                    className="edit-input profile-name-input"
                    value={userData.username}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        username: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div>
                    <p className="profile-eyebrow">
                      {isOwnProfile ? "Your creator profile" : "Spotly creator"}
                    </p>
                    <h2>
                      {userData.username || "Spotly User"}
                      <BadgeCheck size={22} fill="#ff4d67" color="#ff4d67" />
                    </h2>
                  </div>
                )}

                <div className="profile-actions-row">
                  {isOwnProfile && (
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
                              {uploadingPhoto ? "Uploading..." : "Change Photo"}
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                disabled={uploadingPhoto}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) uploadProfileImage(file);
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
                  )}

                  {!isOwnProfile && (
                    <FollowButton
                      userId={Number(targetUserId)}
                      isFollowing={followingIds.includes(Number(targetUserId))}
                      isLoading={loadingId === Number(targetUserId)}
                      onToggle={handleFollowToggle}
                    />
                  )}
                </div>
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
                          location: e.target.value,
                        })
                      }
                    />

                    <textarea
                      className="edit-textarea"
                      value={userData.bio}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          bio: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <p className="profile-location">
                      <MapPin size={16} />
                      {userData.location.replace("📍", "").trim() || "Digital nomad"}
                    </p>
                    <p>{userData.bio}</p>
                    <p>📸 Coffee lover | Adventure seeker</p>
                  </>
                )}
              </div>

              <div className="profile-stat-cards">
                <button className="profile-stat-card" onClick={() => setActiveTab("posts")}>
                  <Image size={18} />
                  <strong>{stats.total_spots || spots.length}</strong>
                  <span>Posts</span>
                </button>

                <button className="profile-stat-card" onClick={() => openFollowModal("followers")}>
                  <Users size={18} />
                  <strong>{followersCount}</strong>
                  <span>Followers</span>
                </button>

                <button className="profile-stat-card" onClick={() => openFollowModal("following")}>
                  <UserPlus size={18} />
                  <strong>{followingCount}</strong>
                  <span>Following</span>
                </button>

                <div className="profile-stat-card">
                  <Heart size={18} />
                  <strong>{stats.total_likes || 0}</strong>
                  <span>Likes</span>
                </div>

                <div className="profile-stat-card">
                  <Bookmark size={18} />
                  <strong>{stats.total_favorites || 0}</strong>
                  <span>Saves</span>
                </div>
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
            {postsLoading ? (
              [1, 2, 3, 4, 5, 6].map((item) => (
                <div className="profile-post profile-post--skeleton skeleton" key={item} />
              ))
            ) : visiblePosts.length > 0 ? (
              visiblePosts.map((spot) => {
                const image = getSpotImage(spot);
                const avatarUser =
                  activeTab === "saved" ? spot.user || targetUser : targetUser;

                return (
                  <div
                    className="profile-post"
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={image} alt={spot.titulo || "post"} />

                    <div
                      className="profile-post-user"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (avatarUser?.id) navigate(`/profile/${avatarUser.id}`);
                      }}
                    >
                      <img
                        src={getUserAvatar(avatarUser, userData.username)}
                        alt={userData.username || "User"}
                      />
                    </div>

                    <div className="profile-post-overlay">
                      <strong>{spot.titulo || "Untitled Spot"}</strong>
                      <span>
                        {spot.likes ?? spot.likes_count ?? 0} likes ·{" "}
                        {spot.favorites ?? spot.favorites_count ?? 0} saves
                      </span>
                    </div>

                    <button
                      className="post-menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Ellipsis size={20} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="profile-empty-state">
                <div>{activeTab === "saved" ? "🔖" : "📍"}</div>
                <h3>{activeTab === "saved" ? "No saved spots yet" : "No posts yet"}</h3>
                <p>
                  {activeTab === "saved"
                    ? "Saved spots will appear here."
                    : "When this user creates spots, they will show up here."}
                </p>
              </div>
            )}
          </section>
        </div>

        <FollowModal
          isOpen={followModalOpen}
          title={followModalType === "followers" ? "Followers" : "Following"}
          users={followModalUsers}
          currentUserId={store.user?.id}
          followingIds={followingIds}
          loadingId={loadingId}
          onClose={() => setFollowModalOpen(false)}
          onToggleFollow={handleFollowToggle}
        />

        <SpotDetailsModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      </main>
    </div>
  );
};
