import {
  Settings,
  Grid3X3,
  Bookmark,
  UserRound,
  BadgeCheck,
  Ellipsis
} from "lucide-react";

import { DashboardSidebar } from "../components/DashboardSidebar";
import "../components/userProfile.css";

import { useState } from "react";

export const Profile = () => {

  const [editing, setEditing] = useState(false);

  const [userData, setUserData] = useState({
    username: "WanderPaws",
    bio: "✨ Exploring new places & capturing moments",
    location: "📍 Digital nomad"
  });

  const posts = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=900",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900"
  ];

  return (
    <div className="spotly-dashboard">

      <DashboardSidebar />

      <main className="dashboard-main">

        <div className="profile-page">

          {/* HEADER */}
          <section className="profile-header">

            <div className="profile-avatar">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500"
                alt="profile"
              />
            </div>

            <div className="profile-info">

              <div className="profile-top">

                {editing ? (
                  <input
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
                    {userData.username}
                    <BadgeCheck
                      size={22}
                      fill="#ff4d67"
                      color="#ff4d67"
                    />
                  </h2>
                )}

                <button
                  className="edit-btn"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "Save Profile" : "Edit Profile"}
                </button>

                <Settings size={22} className="settings-icon" />

              </div>

              <div className="profile-stats">

                <span><strong>128</strong> posts</span>
                <span><strong>4.2k</strong> followers</span>
                <span><strong>312</strong> following</span>

              </div>

              <div className="profile-bio">

                {editing ? (
                  <>
                    <input
                      value={userData.location}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          location: e.target.value
                        })
                      }
                    />

                    <textarea
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

          {/* HIGHLIGHTS */}
          <section className="profile-highlights">

            {["Travel", "Coffee", "Nature"].map((item, index) => (
              <div className="highlight-item" key={index}>

                <div className="highlight-circle">
                  <img
                    src={posts[index]}
                    alt={item}
                  />
                </div>

                <p>{item}</p>

              </div>
            ))}

          </section>

          {/* TABS */}
          <section className="profile-tabs">

            <button className="active">
              <Grid3X3 size={18} />
              POSTS
            </button>

            <button>
              <Bookmark size={18} />
              SAVED
            </button>

            <button>
              <UserRound size={18} />
              TAGGED
            </button>

          </section>

          {/* POSTS */}
          <section className="profile-posts">

            {posts.map((post, index) => (
              <div className="profile-post" key={index}>

                <img src={post} alt="post" />

                <button className="post-menu">
                  <Ellipsis size={20} />
                </button>

              </div>
            ))}

          </section>

        </div>

      </main>

    </div>
  );
};
