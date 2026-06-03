import {
  Settings,
  Grid3X3,
  Bookmark,
  UserRound,
  BadgeCheck,
  Ellipsis,
} from "lucide-react";

import { DashboardSidebar } from "../components/DashboardSidebar";
import "../components/userProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Profile = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [activeTab, setActiveTab] = useState("posts");
  const [spots, setSpots] = useState([]);

  const [profileImage, setProfileImage] = useState(
    `https://i.pravatar.cc/300?u=${store.user?.id}`
  );

  const [userData, setUserData] = useState({
    username: `${store.user?.nombre || ""} ${store.user?.apellido || ""}`,
    bio: "✨ Exploring new places & capturing moments",
    location: "📍 Digital nomad",
  });

  const showToast = (message, type = "success") => {
    dispatch({
      type: "show_toast",
      payload: { message, type },
    });
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
        setSpots(data.spots || data);
      } else {
        showToast(data.msg || "Error loading profile spots", "error");
      }
    } catch (err) {
      console.error("Error loading profile spots:", err);
      showToast("Network error loading profile spots", "error");
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const myPosts = spots.filter(
    (spot) => Number(spot.user?.id) === Number(store.user?.id)
  );

  const savedPosts = spots.filter((spot) => spot.saved);

  const visiblePosts = activeTab === "saved" ? savedPosts : myPosts;

  const totalLikes = myPosts.reduce((total, spot) => total + (spot.likes || 0), 0);

  const totalSaved = myPosts.reduce(
    (total, spot) => total + (spot.favorites || 0),
    0
  );

  const handleFollow = () => {
    setFollowing((prev) => !prev);
    setFollowers((prev) => (following ? prev - 1 : prev + 1));
    showToast(following ? "User unfollowed" : "User followed", "success");
  };

  const handleEditProfile = () => {
    if (editing) {
      showToast("Profile updated!", "success");
    }

    setEditing(!editing);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
      showToast("Profile photo updated!", "success");
    }
  };

  const handleSettingsClick = () => {
    showToast("Settings panel coming soon", "info");
  };

  const openSpot = (spotId) => {
    navigate(`/single/${spotId}`);
  };

  return (
    <div className="spotly-dashboard">
      <DashboardSidebar />

      <main className="dashboard-main">
        <div className="profile-page">
          <section className="profile-header">
            <div className="profile-avatar">
              <img src={profileImage} alt="profile" />

              <label className="change-photo-btn">
                Change Photo

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            <div className="profile-info">
              <div className="profile-top">
                {editing ? (
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

                    <BadgeCheck
                      size={22}
                      fill="#ff4d67"
                      color="#ff4d67"
                    />
                  </h2>
                )}

                <button className="edit-btn" onClick={handleEditProfile}>
                  {editing ? "Save Profile" : "Edit Profile"}
                </button>

                <button className="follow-btn" onClick={handleFollow}>
                  {following ? "Following" : "Follow"}
                </button>

                <button className="settings-btn" onClick={handleSettingsClick}>
                  <Settings size={22} />
                </button>
              </div>

              <div className="profile-stats">
                <span>
                  <strong>{myPosts.length}</strong> posts
                </span>

                <span>
                  <strong>{followers}</strong> followers
                </span>

                <span>
                  <strong>{totalLikes}</strong> likes
                </span>

                <span>
                  <strong>{totalSaved}</strong> saves
                </span>
              </div>

              <div className="profile-bio">
                {editing ? (
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

          <section className="profile-highlights">
            {["Travel", "Coffee", "Nature"].map((item, index) => {
              const image =
                myPosts[index]?.images?.[0] ||
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900";

              return (
                <div className="highlight-item" key={item}>
                  <div className="highlight-circle">
                    <img src={image} alt={item} />
                  </div>

                  <p>{item}</p>
                </div>
              );
            })}
          </section>

          <section className="profile-tabs">
            <button
              className={activeTab === "posts" ? "active" : ""}
              onClick={() => setActiveTab("posts")}
            >
              <Grid3X3 size={18} />
              POSTS
            </button>

            <button
              className={activeTab === "saved" ? "active" : ""}
              onClick={() => setActiveTab("saved")}
            >
              <Bookmark size={18} />
              SAVED
            </button>

            <button
              className={activeTab === "tagged" ? "active" : ""}
              onClick={() => {
                setActiveTab("tagged");
                showToast("Tagged spots coming soon", "info");
              }}
            >
              <UserRound size={18} />
              TAGGED
            </button>
          </section>

          <section className="profile-posts">
            {visiblePosts.length > 0 ? (
              visiblePosts.map((spot) => {
                const image =
                  spot.images?.[0] ||
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900";

                return (
                  <div
                    className="profile-post"
                    key={spot.id}
                    onClick={() => openSpot(spot.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={image} alt={spot.titulo || "post"} />

                    <button
                      className="post-menu"
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast("Post options coming soon", "info");
                      }}
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
                    : activeTab === "tagged"
                    ? "No tagged spots yet."
                    : "No posts yet."}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};