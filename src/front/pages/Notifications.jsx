import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { DashboardSidebar } from "../components/DashboardSidebar";

export const Notifications = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const showToast = (message, type = "success") => {
    dispatch({
      type: "show_toast",
      payload: { message, type },
    });
  };

  const getNotifications = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.msg || "Error loading notifications", "error");
        return;
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      showToast("Network error loading notifications", "error");
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

      const data = await response.json();

      if (!response.ok) {
        showToast(data.msg || "Error marking notification as read", "error");
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      showToast("Notification marked as read", "success");
    } catch (error) {
      console.error("Error marking notification:", error);
      showToast("Network error marking notification", "error");
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await fetch(`${backendUrl}/api/notifications/${notification.id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        });

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        );
      }

      if (notification.spot_id) {
        navigate(`/single/${notification.spot_id}`);
      } else {
        showToast("This notification has no related spot", "info");
      }
    } catch (error) {
      console.error("Error opening notification:", error);
      showToast("Error opening notification", "error");
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

      const data = await response.json();

      if (!response.ok) {
        showToast(data.msg || "Error marking all as read", "error");
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      showToast("All notifications marked as read", "success");
    } catch (error) {
      console.error("Error marking all notifications:", error);
      showToast("Network error marking notifications", "error");
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
            <p>When someone interacts with your spots, it will appear here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${
                  notification.is_read ? "read" : "unread"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
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