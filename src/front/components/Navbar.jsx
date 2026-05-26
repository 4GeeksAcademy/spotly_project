// src/front/components/Navbar.jsx

import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/spotlylogo-wbg.png";

export const Navbar = () => {

    const { store, dispatch } = useGlobalReducer();

    const handleLogout = () => {

        dispatch({
            type: "logout"
        });
    };

    return (
        <nav className="navbar">

            <Link to="/" className="nav-logo">
                <img src={logo} alt="Spotly Logo" />
            </Link>

            <div className="nav-links">
                <Link to="/">Explorar</Link>
                <Link to="/">Categorías</Link>
                <Link to="/">Colecciones</Link>
            </div>

            <div className="nav-auth">

                {store.token ? (
                    <button
                        onClick={handleLogout}
                        className="register-button"
                        style={{
                            border: "none"
                        }}
                    >
                        Logout
                    </button>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="login-link"
                        >
                            Iniciar sesión
                        </Link>

                        <Link
                            to="/register"
                            className="register-button"
                        >
                            Regístrate
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
};