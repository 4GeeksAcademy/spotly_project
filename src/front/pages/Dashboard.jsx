import { MapPin, Heart, MessageCircle, Share2, Bookmark, Search, Bell, User, Home, Compass, Map } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Dashboard = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const spots = [
    {
      user: "Brand Studio",
      location: "Ciudad de México",
      time: "2h",
      text: "Nuevo mural en el corazón de la Roma Norte. Perfecto para fotos y campañas creativas.",
      category: "Murales",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
      likes: 128,
      comments: 24,
      shares: 12
    },
    {
      user: "Ana López",
      location: "Guadalajara",
      time: "4h",
      text: "Rooftop con vista increíble al atardecer. Ideal para reuniones y eventos privados.",
      category: "Rooftops",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900",
      likes: 89,
      comments: 11,
      shares: 7
    }
  ];

  const filteredSpots = spots.filter((spot) => {
    const search = activeSearch.toLowerCase();

    return (
      spot.user.toLowerCase().includes(search) ||
      spot.location.toLowerCase().includes(search) ||
      spot.text.toLowerCase().includes(search) ||
      spot.category.toLowerCase().includes(search)
    );
  });

  return (
    <div className="spotly-dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <img className="dashboard-logo-img" src="./src/front/assets/img/spotlylogo-bbg.png"/>
        </div>

        <nav className="dashboard-menu">
          <a className="active"><Home size={20} /> Dashboard</a>
          <a onClick={() => navigate("/explore")}>
          <Compass size={20} /> Explore</a>
          <a><MapPin size={20} /> Spots</a>
          <a><Bell size={20} /> Notifications</a>
          <a><User size={20} /> Profile</a>
                    <button
            className="logout-btn"
             onClick={() => {
            localStorage.removeItem("token");

            dispatch({
              type: "logout"
              });

            navigate("/");
             }}
                >
             Logout
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-search">
  <Search size={20} />

  <input
    placeholder="Buscar spots, lugares, usuarios..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        setActiveSearch(searchTerm);
      }
    }}
  />

  <button
    className="search-btn"
    onClick={() => setActiveSearch(searchTerm)}
  >
    Buscar
  </button>
</div>

          <div className="dashboard-user">
            <Bell size={22} />
            <img src="https://i.pravatar.cc/100?img=12" alt="User" />
            <div>
              <strong>
                {store.user?.nombre} {store.user?.apellido}
              </strong>

            </div>
          </div>
        </header>

        <section className="create-post-card">
          <div className="create-post-input">
            <img src="https://i.pravatar.cc/100?img=12" alt="User" />
            <input placeholder="Share a new spot!" />
          </div>

          <div className="create-post-actions">
            <span>Photo/Video</span>
            <span>Location</span>
            <span>Tag</span>
            <button>Post</button>
          </div>
        </section>

        <section className="feed">
  {filteredSpots.length > 0 ? (
    filteredSpots.map((spot, index) => (
      <article className="spot-post" key={index}>
        <div className="post-header">
          <img src={`https://i.pravatar.cc/100?img=${index + 30}`} alt={spot.user} />
          <div>
            <strong>{spot.user}</strong>
            <p>{spot.location} · {spot.time}</p>
          </div>
        </div>

        <p className="post-text">{spot.text}</p>

        <img className="single-post-img" src={spot.image} alt={spot.category} />

        <div className="post-actions">
          <span><Heart size={20} /> {spot.likes}</span>
          <span><MessageCircle size={20} /> {spot.comments}</span>
          <span><Share2 size={20} /> {spot.shares}</span>
          <span><Bookmark size={20} /></span>
        </div>
      </article>
    ))
  ) : (
    <div className="spot-post">
      <p>
        No se encontraron spots para: <strong>{activeSearch}</strong>
      </p>
    </div>
  )}
</section>
      </main>

      <aside className="dashboard-rightbar">
        <div className="right-card">
          <div className="card-title">
            <h3>Suggested for you</h3>
            <span>All</span>
          </div>

          {["Astrid Mata", "Alexis Peña", "Deimian Vasquez"].map((name, index) => (
            <div className="suggestion" key={index}>
              <img src={`https://i.pravatar.cc/100?img=${index + 20}`} alt={name} />
              <div>
                <strong>{name}</strong>
                <p>Web Developer</p>
              </div>
              <button>Follow</button>
            </div>
          ))}
        </div>

        <div className="right-card">
          <div className="card-title">
            <h3>Trending spots</h3>
            <span>See more...</span>
          </div>

          {["Rooftops", "Murals", "Parks", "Sports", "Beaches"].map((trend, index) => (
            <div className="trend" key={index}>
              <span>{index + 1}</span>
              <div>
                <strong>{trend}</strong>
                <p>{12 - index * 2}.4K posts</p>
              </div>
            </div>
          ))}
        </div>

        <div className="right-card">
          <div className="card-title">
            <h3>Spots map</h3>
            <span>Full map</span>
          </div>
          <div className="fake-map">
            <MapPin />
            <MapPin />
            <MapPin />
            <MapPin />
          </div>
        </div>
      </aside>
    </div>
  );
};