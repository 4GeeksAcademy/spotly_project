import { Link } from "react-router-dom";
import heroImage from "../assets/img/hero-bg.jpg";

export const Home = () => {
  return (
    <main className="home-page">
      <section className="landing-hero">
        <div className="landing-content">
          <span className="landing-badge">✦ Discover. Share. Connect.</span>

          <h1>
            Find amazing places.{" "}
            <span>Share unforgettable moments.</span>
          </h1>

          <p>
            Spotly is your social map to discover, save and share the best
            places around the world.
          </p>

          <div className="landing-buttons">
            <Link to="/register" className="landing-primary">
              Get started →
            </Link>

            <Link to="/login" className="landing-secondary">
              Explore spots 📍
            </Link>
          </div>

          <div className="landing-users">
            <div className="landing-avatars">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Join thousands of explorers sharing their favorite spots</p>
          </div>
        </div>

        <div className="landing-gallery">
          <div className="spot-card big-card">
            <img src={heroImage} alt="Paradise spot" />
            <span>Paradise 🌴</span>
          </div>

          <div className="spot-card">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
              alt="Adventure"
            />
            <span>Adventure ⛰️</span>
          </div>

          <div className="spot-card">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
              alt="Hidden gems"
            />
            <span>Hidden gems ✨</span>
          </div>

          <div className="spot-card">
            <img
              src="https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=900&q=80"
              alt="City vibes"
            />
            <span>City vibes 🌆</span>
          </div>

          <div className="floating-pin"><img src="./public/Favicon-spotly.png"/></div>
        </div>
      </section>

      <section className="why-section">
        <span>WHY SPOTLY?</span>
        <h2>More than a map. It’s a community.</h2>

        <div className="features">
          <article>
            <div className="featurespin"><i className="fa-solid fa-compass"></i></div>
            <h3>Discover</h3>
            <p>Find incredible places recommended by real people like you.</p>
          </article>

          <article>
            <div className="hearth"><i className="fa-solid fa-bookmark"></i></div>
            <h3>Save</h3>
            <p>Save your favorite spots and organize them in collections.</p>
          </article>

          <article>
            <div className="featurescamera"><i className="fa-solid fa-camera"></i></div>
            <h3>Share</h3>
            <p>Share your experiences and inspire other adventurers.</p>
          </article>

          <article>
            <div className="featurespeople"><i className="fa-solid fa-user-group"></i></div>
            <h3>Connect</h3>
            <p>Follow other explorers and build a community around your passions.</p>
          </article>
        </div>
      </section>
    </main>
  );
};