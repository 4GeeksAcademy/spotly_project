import { MapPin, Bell, User, Home, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo">
        <img
          className="dashboard-logo-img"
          src="./src/front/assets/img/spotlylogo-bbg.png"
          alt="Spotly logo"
        />
      </div>

      <nav className="dashboard-menu">
        <a onClick={() => navigate("/dashboard")}>
          <Home size={20} /> Dashboard
        </a>

        <a onClick={() => navigate("/explore")}>
          <Compass size={20} /> Explore
        </a>

        <a>
          <MapPin size={20} /> Spots
        </a>

        <a>
          <Bell size={20} /> Notifications
        </a>

        <a>
          <User size={20} /> Profile
        </a>

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
  );
};