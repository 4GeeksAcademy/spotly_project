export const SpotCard = ({ image, title, location, category, rating }) => {
  return (
    <div className="spot-card">
      <div className="spot-image">
        <img src={image} alt={title} />
      </div>

      <div className="spot-content">
        <div className="spot-meta">
          <span className="spot-category">{category}</span>
          <span className="spot-rating">⭐ {rating}</span>
        </div>

        <h3>{title}</h3>
        <p>{location}</p>
      </div>
    </div>
  );
};