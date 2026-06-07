import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const LocationSearch = ({ onLocationSelect, isDark = false }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const searchLocation = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("Write a location first");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );

      const data = await response.json();

      if (!data.length) {
        toast.error("Location not found");
        return;
      }

      const location = data[0];

      onLocationSelect([
        parseFloat(location.lat),
        parseFloat(location.lon),
        location.display_name,
      ]);

      toast.success("Location selected");
    } catch (error) {
      console.error(error);
      toast.error("Error searching location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={searchLocation} className="location-search">
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Search location, address or city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "10px",
            border: isDark ? "1px solid #374151" : "1px solid #d1d5db",
            background: isDark ? "#0b0f17" : "#ffffff",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            border: "none",
            borderRadius: "10px",
            padding: "0 14px",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
          Search
        </button>
      </div>
    </form>
  );
};