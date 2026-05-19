import { Link } from "react-router-dom";
import logo from "../assets/img/spotlylogo-wbg.png";

export const Navbar = () => {
  return (
    <nav className="navbar">

      <Link to="/" className="nav-logo">
        <img src={logo} alt="Spotly Logo" />
      </Link>

      <div className="nav-links">
        <Link to="/">Explorar</Link>
        <Link to="/">Categorías</Link>
        <Link to="/">Colecciones</Link>
        <Link to="/">Cómo funciona</Link>
      </div>

      <div className="nav-auth">

        <Link to="/login" className="login-link">
          Iniciar sesión
        </Link>

        <Link to="/register" className="register-button">
          Regístrate
        </Link>

      </div>

    </nav>
  );
};