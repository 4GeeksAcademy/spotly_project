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
import "../components/userProfile.css";
import { useEffect, useState, useMemo } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export const Profile = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);
  const [spots, setSpots] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [targetUser, setTargetUser] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
    return [];
  };

  const fetchTargetUser = async () => {
    if (!targetUserId) return;

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
        `${import.meta.env.VITE_BACKEND_URL}api/users/${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setTargetUser(data);
        setUserData((prev) => ({
          ...prev,
          username: `${data.nombre || ""} ${data.apellido || ""}`.trim(),
        }));
      } else {
        toast.error(data.msg || "Error loading user");
      }
    } catch (err) {
      console.error("Error loading user:", err);
      toast.error("Error loading user");
    }
  };

  const fetchSpots = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "api/spots", {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSpots(data.spots || data);
      }
    } catch (err) {
      console.error("Error loading spots:", err);
    }
  };

  const fetchFollowers = async () => {
    if (!targetUserId) return;

    const endpoint = isOwnProfile
      ? "api/users/me/followers"
      : `api/users/${targetUserId}/followers`;

    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + endpoint, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await res.json();
      console.log("FOLLOW MODAL RESPONSE:", data);

      if (res.ok) {
        const users = normalizeUsersResponse(data);
        setFollowersCount(data.count ?? users.length ?? 0);
      }
    } catch (err) {
      console.error("Error cargando followers:", err);
    }
  };

  const fetchTargetFollowingCount = async () => {
    if (!targetUserId) return;

    const endpoint = isOwnProfile
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
        const users = normalizeUsersResponse(data);
        setFollowingCount(data.count ?? users.length ?? 0);
      }
    } catch (err) {
      console.error("Error cargando following count:", err);
    }
  };

  const fetchMyFollowing = async () => {
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
        setFollowingIds(users.map((u) => u.id));
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
            prev.includes(targetId) ? prev : [...prev, targetId]
          );
          setFollowersCount((prev) =>
            Number(targetId) === Number(targetUserId) ? prev + 1 : prev
          );
          toast.success("Following user");
        } else {
          setFollowingIds((prev) => prev.filter((id) => id !== targetId));
          setFollowersCount((prev) =>
            Number(targetId) === Number(targetUserId)
              ? Math.max(prev - 1, 0)
              : prev
          );
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
    fetchTargetUser();
    fetchSpots();
    fetchFollowers();
    fetchTargetFollowingCount();
    fetchMyFollowing();
  }, [userId, store.user?.id, store.user?.profile_image]);

  const myPosts = spots.filter(
    (spot) => Number(spot.user?.id) === Number(targetUserId)
  );

  const savedPosts = spots.filter((spot) => spot.saved || spot.is_favorite);
  const visiblePosts = activeTab === "saved" ? savedPosts : myPosts;

  const totalLikes = myPosts.reduce(
    (total, spot) => total + (spot.likes_count || spot.likes || 0),
    0
  );

  const totalSaved = myPosts.reduce(
    (total, spot) => total + (spot.favorites_count || spot.favorites || 0),
    0
  );

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
                      setUserData({ ...userData, username: e.target.value })
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
                                uploadProfileImage(file);
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
                  <strong>{myPosts.length}</strong> posts
                </span>

                <span onClick={() => openFollowModal("followers")}>
                  <strong>{followersCount}</strong> followers
                </span>

                <span onClick={() => openFollowModal("following")}>
                  <strong>{followingCount}</strong> following
                </span>

                <span>
                  <strong>{totalLikes}</strong> likes
                </span>

                <span>
                  <strong>{totalSaved}</strong> saves
                </span>
              </div>

              <div className="profile-bio">
                {isOwnProfile && editing ? (
                  <>
                    <input
                      className="edit-input"
                      value={userData.location}
                      onChange={(e) =>
                        setUserData({ ...userData, location: e.target.value })
                      }
                    />
                    <textarea
                      className="edit-textarea"
                      value={userData.bio}
                      onChange={(e) =>
                        setUserData({ ...userData, bio: e.target.value })
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
                const image =
                  spot.images?.[0]?.image_url ||
                  spot.images?.[0] ||
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900";

                return (
                  <div className="profile-post" key={spot.id}>
                    <img src={image} alt={spot.titulo || "post"} />

                    <div className="profile-post-user">
                      <img src={getAvatarUrl()} alt={userData.username || "User"} />
                    </div>

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
      </main>
    </div>
  );
};