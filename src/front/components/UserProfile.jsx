import React from "react";
import "../Styles/userProfile.css";

export const UserProfile = () => {

  const posts = Array(9).fill(
    "https://picsum.photos/300"
  );

  return (
    <div className="profile-page">

      {/* PROFILE HEADER */}

      <div className="profile-header">

        <div className="profile-image-container">
          <img
            src="https://i.pravatar.cc/300"
            alt="profile"
            className="profile-image"
          />
        </div>

        <div className="profile-stats">

          <div>
            <strong>24</strong>
            <span>Posts</span>
          </div>

          <div>
            <strong>1.2K</strong>
            <span>Followers</span>
          </div>

          <div>
            <strong>320</strong>
            <span>Following</span>
          </div>

        </div>

      </div>

      {/* INFO */}

      <div className="profile-info">

        <h3>Alba Hidalgo</h3>

        <p className="profile-role">
          Frontend Developer
        </p>

        <p>
          Proyecto final Spotly 🚀
        </p>

      </div>

      {/* BUTTONS */}

      <div className="profile-buttons">

        <button>Edit Profile</button>

        <button>Share Profile</button>

      </div>

      {/* STORIES */}

      <div className="stories-container">

        {[1,2,3,4].map((story) => (
          <div key={story} className="story-item">

            <div className="story-circle"></div>

            <span>Story</span>

          </div>
        ))}

      </div>

      {/* POSTS */}

      <div className="posts-grid">

        {posts.map((post, index) => (
          <img
            key={index}
            src={post}
            alt="post"
            className="post-image"
          />
        ))}

      </div>

    </div>
  );
};