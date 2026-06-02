import { useEffect, useState } from "react";
import { MapPin, Bell, User, Home, Compass, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const [unreadCount, setUnreadCount] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const getUnreadNotifications = async () => {
      try {
        if (!store.token) return;

        const response = await fetch(`${backendUrl}/api/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
      }
    };

    getUnreadNotifications();
  }, [store.token]);

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

        <a onClick={() => navigate("/notifications")} className="notifications-link">
          <div className="notifications-icon-wrapper">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notifications-badge">
                {unreadCount}
              </span>
            )}
          </div>
          Notifications
        </a>

        <a onClick={() => navigate("/profile")}>
          <User size={20} /> Profile
        </a>

        <button
          className="theme-toggle-btn"
          onClick={() => dispatch({ type: "toggle_theme" })}
        >
          {store.theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          {store.theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            dispatch({ type: "logout" });
            navigate("/");
          }}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};