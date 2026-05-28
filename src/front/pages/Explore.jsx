import { Search, MapPin, Heart, Bookmark } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";

export const Explore = () => {
  const exploreSpots = [
    {
      title: "Rooftop at sunset",
      location: "Miami, FL",
      category: "Rooftop",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=700",
      likes: 234
    },
    {
      title: "Urban mural wall",
      location: "Wynwood, Miami",
      category: "Murals",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=700",
      likes: 412
    },
    {
      title: "Hidden coffee shop",
      location: "Austin, TX",
      category: "Coffee",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700",
      likes: 188
    },
    {
      title: "Beach photo spot",
      location: "Malibu, CA",
      category: "Beach",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700",
      likes: 530
    },
    {
      title: "Industrial studio",
      location: "Brooklyn, NY",
      category: "Studio",
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=700",
      likes: 143
    },
    {
      title: "City night view",
      location: "Las Vegas, NV",
      category: "Viewpoint",
      image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=700",
      likes: 389
    }
  ];

return (
  <div className="spotly-dashboard">

    <DashboardSidebar />

    <main className="dashboard-main">

      <div className="explore-page">

        <div className="explore-header">
          <div>
            <h1>Explore Spots</h1>
            <p>Discover trending places, hidden gems and creative locations.</p>
          </div>

          <div className="explore-search">
            <Search size={20} />
            <input placeholder="Search spots..." />
          </div>
        </div>

        <div className="explore-categories">
          {["All", "Rooftops", "Coffee", "Murals", "Beaches", "Studios", "Views"].map((category, index) => (
            <button className={index === 0 ? "active" : ""} key={category}>
              {category}
            </button>
          ))}
        </div>

        <section className="explore-grid">
          {exploreSpots.map((spot, index) => (
            <article className="explore-card" key={index}>
              <img src={spot.image} alt={spot.title} />

              <div className="explore-card-overlay">
                <span>{spot.category}</span>

                <button>
                  <Bookmark size={18} />
                </button>
              </div>

              <div className="explore-card-content">
                <h3>{spot.title}</h3>

                <p>
                  <MapPin size={16} />
                  {spot.location}
                </p>

                <div className="explore-card-footer">
                  <span>
                    <Heart size={17} />
                    {spot.likes}
                  </span>

                  <button>Check</button>
                </div>
              </div>
            </article>
          ))}
        </section>

      </div>

    </main>

  </div>
);
};