import { useState } from "react";

export const FollowButton = ({ userId, isFollowing, isLoading, onToggle }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={() => onToggle(userId)}
            disabled={isLoading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                backgroundColor: isFollowing ? (hovered ? "#fee2e2" : "#f3f4f6") : "#ef3340",
                color: isFollowing ? (hovered ? "#ef3340" : "#1f2937") : "#ffffff",
                border: isFollowing ? "1px solid #d1d5db" : "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "0.85rem",
                transition: "all 0.2s",
                minWidth: "80px",
            }}
        >
            {isLoading ? "..." : isFollowing ? (hovered ? "Unfollow" : "Following") : "Follow"}
        </button>
    );
};