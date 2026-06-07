import {
  Settings,
  Grid3X3,
  Bookmark,
  BadgeCheck,
  Ellipsis,
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
        const allSpots = data.spots || data;
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

  return (
    <div className="spotly-dashboard">
      <DashboardSidebar />

      <main className="dashboard-main">
        <div className="profile-page">
          <section className="profile-header">
            <div className="profile-avatar">
              <img src={getAvatarUrl()} alt="profile" />

              {isOwnProfile && (
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
                    className="edit-input"
                    value={userData.username}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        username: e.target.value,
                      })
                    }
                  />
                ) : (
                  <h2>
                    {userData.username || "Spotly User"}
                    <BadgeCheck size={22} fill="#ff4d67" color="#ff4d67" />
                  </h2>
                )}

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

              <div className="profile-stats">
                <span>
                  <strong>{stats.total_spots || spots.length}</strong> posts
                </span>

                <span onClick={() => openFollowModal("followers")}>
                  <strong>{followersCount}</strong> followers
                </span>

                <span onClick={() => openFollowModal("following")}>
                  <strong>{followingCount}</strong> following
                </span>

                <span>
                  <strong>{stats.total_likes || 0}</strong> likes
                </span>

                <span>
                  <strong>{stats.total_favorites || 0}</strong> saves
                </span>
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
              <div className="spot-post">
                <p>
                  {activeTab === "saved"
                    ? "No saved spots yet."
                    : "No posts yet."}
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