import { X, UserPlus, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getAvatar = (user) =>
  user?.profile_image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || "Spotly User"
  )}&background=ef3340&color=fff`;

const getUserId = (user) => {
  return user?.id || user?.user_id || user?.follower_id || user?.followed_id;
};

const getDisplayUser = (item) => {
  return item?.user || item?.follower || item?.followed || item;
};

export const FollowModal = ({
  isOpen,
  title,
  users = [],
  currentUserId,
  followingIds = [],
  loadingId,
  onClose,
  onToggleFollow,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const normalizedUsers = users
    .map((item) => getDisplayUser(item))
    .filter(Boolean);

  const goToProfile = (userId) => {
    if (!userId) return;

    onClose?.();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="follow-modal-overlay" onClick={onClose}>
      <div className="follow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-header">
          <h3>{title}</h3>

          <button type="button" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="follow-modal-list">
          {normalizedUsers.length === 0 ? (
            <div className="follow-modal-empty">
              <p>No users found.</p>
            </div>
          ) : (
            normalizedUsers.map((user, index) => {
              const userId = getUserId(user);
              const isOwnUser = Number(userId) === Number(currentUserId);
              const isFollowing = followingIds
                .map(Number)
                .includes(Number(userId));
              const isLoading = Number(loadingId) === Number(userId);

              return (
                <div className="follow-modal-user" key={userId || index}>
                  <img
                    className="follow-modal-avatar"
                    src={getAvatar(user)}
                    alt={user?.nombre || "User"}
                    onClick={() => goToProfile(userId)}
                    style={{ cursor: "pointer" }}
                  />

                  <div
                    className="follow-modal-info"
                    onClick={() => goToProfile(userId)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>
                      {user?.nombre || "Spotly"} {user?.apellido || "User"}
                    </strong>
                    <span>Spotly user</span>
                  </div>

                  {!isOwnUser && (
                    <button
                      type="button"
                      className={`follow-modal-btn ${
                        isFollowing ? "following" : ""
                      }`}
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFollow(userId);
                      }}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={16} />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};