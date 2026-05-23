import heroImage from "../assets/img/hero-bg.jpg";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  return (
    <main className="home">

      <section className="hero"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}>
        <div className="hero-overlay"></div>

        <div className="hero-content">

          <h1>
            Descubre spots increíbles
            <span> cerca de ti.</span>
          </h1>

          <p>
            Explora lugares únicos, comparte experiencias y conecta con personas que aman descubrir nuevos spots igual que tú.
          </p>

          <div className="hero-buttons">

            <button className="primary-button">
              Explorar mapa
            </button>

            <button className="secondary-button"
              onClick={() => navigate("/crear-spot")}>
              Crear Spot
            </button>

          </div>

        </div>


      </section>
    </main>
  );
};