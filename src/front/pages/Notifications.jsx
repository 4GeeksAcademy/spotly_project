import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { DashboardSidebar } from "../components/DashboardSidebar";
import toast from "react-hot-toast";

export const Notifications = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAvatar = (user) =>
    user?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || "Spotly User"
    )}&background=ef3340&color=fff`;

  const getNotifications = async () => {
    if (!store.token) return;

    try {
      setLoading(true);

      const response = await fetch(`${backendUrl}api/notifications`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.msg || "Error loading notifications");
        return;
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Network error loading notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId || !store.token) return false;

    try {
      setMarkingId(notificationId);

      const response = await fetch(
        `${backendUrl}api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.msg || "Error marking notification as read");
        return false;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      return true;
    } catch (error) {
      console.error("Error marking notification:", error);
      toast.error("Network error updating notification");
      return false;
    } finally {
      setMarkingId(null);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;

    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.spot_id) {
      navigate(`/single/${notification.spot_id}`);
      return;
    }

    if (notification.sender?.id) {
      navigate(`/profile/${notification.sender.id}`);
      return;
    }

    if (notification.sender_id) {
      navigate(`/profile/${notification.sender_id}`);
    }
  };

  const handleSenderClick = (e, sender) => {
    e.stopPropagation();

    if (sender?.id) {
      navigate(`/profile/${sender.id}`);
    }
  };

  const markAllAsRead = async () => {
    if (!store.token) return;

    try {
      setMarkingAll(true);

      const response = await fetch(`${backendUrl}api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.msg || "Error marking all notifications as read");
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications:", error);
      toast.error("Network error updating notifications");
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    getNotifications();
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
            <button
              className="mark-all-btn"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              <CheckCheck size={18} />
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="notifications-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={36} />
            <h3>No notifications yet</h3>
            <p>When someone interacts with you, it will appear here.</p>
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
                <div
                  className="notification-icon notification-avatar"
                  onClick={(e) => handleSenderClick(e, notification.sender)}
                  style={{ cursor: notification.sender?.id ? "pointer" : "default" }}
                >
                  {notification.sender ? (
                    <img
                      src={getAvatar(notification.sender)}
                      alt={notification.sender.nombre || "User"}
                    />
                  ) : (
                    <Bell size={20} />
                  )}
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
                    disabled={markingId === notification.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    {markingId === notification.id ? "Marking..." : "Mark as read"}
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
