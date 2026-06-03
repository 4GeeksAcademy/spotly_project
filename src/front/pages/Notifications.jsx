import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { DashboardSidebar } from "../components/DashboardSidebar";

export const Notifications = () => {
  const { store } = useGlobalReducer();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getNotifications = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error cargando notificaciones");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      if (!response.ok) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marcando notificación:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      if (!response.ok) return;

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error("Error marcando todas:", error);
    }
  };

  useEffect(() => {
    if (store.token) {
      getNotifications();
    }
  }, [store.token]);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="notifications-page">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with activity on your spots.</p>
          </div>

          {notifications.some((notification) => !notification.is_read) && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              <CheckCheck size={18} />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="notifications-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={36} />
            <h3>No notifications yet</h3>
            <p>When someone comments on your spot, it will appear here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${notification.is_read ? "read" : "unread"
                  }`}
                onClick={() => handleNotificationClick(notification)}
                style={{ cursor: "pointer" }}
              >
                <div className="notification-icon">
                  <Bell size={20} />
                </div>

                <div className="notification-content">
                  <p>{notification.message}</p>

                  <span>
                    {notification.created_at
                      ? new Date(notification.created_at).toLocaleString()
                      : "Recently"}
                  </span>
                </div>

                {!notification.is_read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};