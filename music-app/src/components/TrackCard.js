import React from "react";
import "./TrackCard.css";

// Genre → gradient map
const GENRE_COLORS = {
  rock: "linear-gradient(135deg,#7f1d1d,#991b1b)",
  pop: "linear-gradient(135deg,#4c1d95,#7c3aed)",
  jazz: "linear-gradient(135deg,#1e3a5f,#2563eb)",
  electronic: "linear-gradient(135deg,#064e3b,#059669)",
  country: "linear-gradient(135deg,#78350f,#d97706)",
  default: "linear-gradient(135deg,#1e1b4b,#312e81)",
};

const NOTE_ICONS = ["🎵","🎶","🎸","🥁","🎹","🎺","🎻","🪗"];

function randomNote(id) {
  return NOTE_ICONS[id.charCodeAt(0) % NOTE_ICONS.length];
}

export default function TrackCard({ track, isFavorite, onToggleFavorite, isLoggedIn }) {
  const bg = GENRE_COLORS[track.genre?.toLowerCase()] ?? GENRE_COLORS.default;
  const icon = randomNote(track.id);

  const handleFav = (e) => {
    e.stopPropagation();
    if (isLoggedIn) onToggleFavorite(track.id);
  };

  return (
    <div className="track-card">
      <div className="track-thumb" style={{ background: bg }}>
        <span className="track-icon">{icon}</span>
        {track.isNew && <span className="track-badge">NEW</span>}
        <button
          className={`track-fav-btn ${isFavorite ? "active" : ""}`}
          onClick={handleFav}
          title={isLoggedIn ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Sign in to favorite"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
      <div className="track-body">
        <h3 className="track-name">{track.title}</h3>
        <p className="track-artist">{track.artist}</p>
        <div className="track-meta">
          {track.genre && <span className="track-genre">{track.genre}</span>}
          {track.duration && <span className="track-duration">{track.duration}</span>}
        </div>
      </div>
    </div>
  );
}
