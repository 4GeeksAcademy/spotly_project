import { Link } from "react-router-dom";
import logo from "../assets/img/spotlylogo-wbg.png";
export const Navbar = ({ setAuthMode }) => {
  return (
    <nav className="navbar">

      <div className="nav-logo">
        <img src="/logo.png" alt="Spotly Logo" />
      </div>

      <div className="nav-auth">

        <button
          className="login-link"
          onClick={() => setAuthMode("login")}
        >
          Iniciar sesión
        </button>

        <button
          className="register-button"
          onClick={() => setAuthMode("register")}
        >
          Regístrate
        </button>

      </div>

    </nav>
  );
};