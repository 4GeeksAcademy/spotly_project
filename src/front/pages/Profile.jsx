import { Settings, Grid3X3, Bookmark, UserRound } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import "../components/userProfile.css";

export const Profile = () => {

  const posts = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=700",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700"
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
                src="https://i.pravatar.cc/300"
                alt="profile"
              />
            </div>

            <div className="profile-info">

              <div className="profile-top">

                <h2>albahidalgo</h2>

                <button>Edit Profile</button>

                <Settings size={22} />

              </div>

              <div className="profile-stats">

                <span><strong>395</strong> posts</span>
                <span><strong>17.8k</strong> followers</span>
                <span><strong>580</strong> following</span>

              </div>

              <div className="profile-bio">

                <h4>Alba Hidalgo</h4>

                <p>📍 Costa Rica</p>

                <p>✨ Content creator & traveler</p>

              </div>

            </div>

          </section>

          {/* HIGHLIGHTS */}
          <section className="profile-highlights">

            <div className="highlight-item">
              <div className="highlight-circle"></div>
              <p>Travel</p>
            </div>

            <div className="highlight-item">
              <div className="highlight-circle"></div>
              <p>Food</p>
            </div>

            <div className="highlight-item">
              <div className="highlight-circle"></div>
              <p>Nature</p>
            </div>

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
              </div>
            ))}

          </section>

        </div>

      </main>

    </div>
  );
};