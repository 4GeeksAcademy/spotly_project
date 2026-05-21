import { Link } from "react-router-dom";
import logo from "../assets/img/spotlylogo-wbg.png";

import useGlobalReducer from "../hooks/useGlobalReducer";
import { logoutUser } from "../store";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();

  const handleLogout = () => {
    logoutUser(dispatch);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <img src={logo} alt="Spotly Logo" />
      </Link>

      <div className="nav-links">
        <Link to="/">Explorar</Link>
        <Link to="/">Categorías</Link>
        <Link to="/">Favoritos</Link>
        <Link to="/">Colecciones</Link>
      </div>

      <div className="nav-auth">
        {store.isAuthenticated ? (
          <>
            <span className="user-name">
              {store.user?.nombre}
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-link">
              Iniciar sesión
            </Link>

            <Link to="/register" className="register-button">
              Regístrate
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};