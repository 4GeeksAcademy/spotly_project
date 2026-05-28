import { MapPin, Heart, MessageCircle, Share2, Bookmark, Plus, Search, Bell, User, Home, Compass, Map, Crown } from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="spotly-dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <span><img src="./src/front/assets/img/spotlylogo-bbg.png"/></span>
        </div>

        <nav className="dashboard-menu">
          <a className="active"><Home size={20} /> Inicio</a>
          <a><Compass size={20} /> Explorar</a>
          <a><MapPin size={20} /> Spots</a>
          <a><Map size={20} /> Mapa</a>
          <a><Bookmark size={20} /> Guardados</a>
          <a><Bell size={20} /> Notificaciones</a>
          <a><User size={20} /> Perfil</a>
        </nav>

        <button className="publish-spot-btn">
          <Plus size={20} />
          Publicar Spot
        </button>

        <div className="pro-card">
          <Crown size={28} />
          <h3>Plan Pro</h3>
          <p>Llega a más personas con tus spots.</p>
          <button>Ver beneficios</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-search">
            <Search size={20} />
            <input placeholder="Buscar spots, lugares, usuarios..." />
          </div>

          <div className="dashboard-user">
            <button className="circle-btn"><Plus size={22} /></button>
            <Bell size={22} />
            <img src="https://i.pravatar.cc/100?img=12" alt="User" />
            <div>
              <strong>Juan Pérez</strong>
              <span>@juanperez</span>
            </div>
          </div>
        </header>

        <section className="stories-card">
          {[
            ["Tu historia", "https://i.pravatar.cc/100?img=12"],
            ["María G.", "https://i.pravatar.cc/100?img=32"],
            ["Café Luna", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200"],
            ["Pedro S.", "https://i.pravatar.cc/100?img=15"],
            ["Brand Studio", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=200"]
          ].map((story, index) => (
            <div className="story" key={index}>
              <img src={story[1]} alt={story[0]} />
              <span>{story[0]}</span>
            </div>
          ))}
        </section>

        <section className="create-post-card">
          <div className="create-post-input">
            <img src="https://i.pravatar.cc/100?img=12" alt="User" />
            <input placeholder="¿Qué spot quieres mostrar hoy?" />
          </div>

          <div className="create-post-actions">
            <span>Foto/Video</span>
            <span>Ubicación</span>
            <span>Etiquetar</span>
            <button>Publicar</button>
          </div>
        </section>

        <section className="feed">
          <article className="spot-post">
            <div className="post-header">
              <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=100" alt="Brand" />
              <div>
                <strong>Brand Studio <span className="pro-badge">Pro</span></strong>
                <p>Ciudad de México · 2h</p>
              </div>
            </div>

            <p className="post-text">
              Nuevo mural en el corazón de la Roma Norte. Perfecto para fotos y campañas creativas.
            </p>

            <div className="post-grid">
              <img className="big-img" src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800" alt="Mural" />
              <img src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400" alt="Spot" />
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" alt="Rooftop" />
            </div>

            <div className="post-actions">
              <span><Heart size={20} /> 128</span>
              <span><MessageCircle size={20} /> 24</span>
              <span><Share2 size={20} /> 12</span>
              <span><Bookmark size={20} /></span>
            </div>
          </article>

          <article className="spot-post">
            <div className="post-header">
              <img src="https://i.pravatar.cc/100?img=44" alt="Ana" />
              <div>
                <strong>Ana López</strong>
                <p>Guadalajara · 4h</p>
              </div>
            </div>

            <p className="post-text">
              Rooftop con vista increíble al atardecer. Ideal para reuniones y eventos privados.
            </p>

            <img className="single-post-img" src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900" alt="Rooftop" />

            <div className="post-actions">
              <span><Heart size={20} /> 89</span>
              <span><MessageCircle size={20} /> 11</span>
              <span><Share2 size={20} /> 7</span>
              <span><Bookmark size={20} /></span>
            </div>
          </article>
        </section>
      </main>

      <aside className="dashboard-rightbar">
        <div className="right-card">
          <div className="card-title">
            <h3>Personas recomendadas</h3>
            <span>Ver todas</span>
          </div>

          {["Carlos Mendoza", "María González", "Studio Creativo"].map((name, index) => (
            <div className="suggestion" key={index}>
              <img src={`https://i.pravatar.cc/100?img=${index + 20}`} alt={name} />
              <div>
                <strong>{name}</strong>
                <p>Creador de contenido</p>
              </div>
              <button>Seguir</button>
            </div>
          ))}
        </div>

        <div className="right-card">
          <div className="card-title">
            <h3>Tendencias de spots</h3>
            <span>Ver más</span>
          </div>

          {["Rooftops", "Murales", "Cafeterías", "Espacios industriales", "Playas"].map((trend, index) => (
            <div className="trend" key={index}>
              <span>{index + 1}</span>
              <div>
                <strong>{trend}</strong>
                <p>{12 - index * 2}.4K publicaciones</p>
              </div>
            </div>
          ))}
        </div>

        <div className="right-card">
          <div className="card-title">
            <h3>Mapa de spots</h3>
            <span>Ver mapa</span>
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