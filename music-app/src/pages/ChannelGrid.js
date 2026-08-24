import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import TrackCard from "../components/TrackCard";
import SkeletonCard from "../components/SkeletonCard";
import "./ChannelGrid.css";

// Sample tracks – in production these could come from Firestore
const ALL_TRACKS = [
  { id: "bang-the-drum",    title: "Bang the Drum",       artist: "Session Artist",  genre: "Rock",       duration: "3:42", isNew: true  },
  { id: "one-more-sunrise", title: "One More Sunrise",    artist: "Morning Crew",    genre: "Pop",        duration: "4:15", isNew: false },
  { id: "paper-map-summit", title: "Paper Map Summit",    artist: "The Wanderers",   genre: "Country",    duration: "3:58", isNew: false },
  { id: "receipt-queen",    title: "Receipt Queen",       artist: "Urban Stories",   genre: "Electronic", duration: "3:21", isNew: true  },
  { id: "red-hand-mark",    title: "Red Hand Mark",       artist: "Dark Matter",     genre: "Rock",       duration: "4:02", isNew: false },
  { id: "neon-highways",    title: "Neon Highways",       artist: "Synth Wave Co.",  genre: "Electronic", duration: "5:10", isNew: false },
  { id: "velvet-mornings",  title: "Velvet Mornings",     artist: "Jazz Collective", genre: "Jazz",       duration: "6:30", isNew: true  },
  { id: "silver-lining",    title: "Silver Lining",       artist: "Indie Bloom",     genre: "Pop",        duration: "3:55", isNew: false },
];

const TABS = ["All", "Favorites"];

export default function ChannelGrid() {
  const user = useAuth();
  const { favorites, loading: favLoading, toggle } = useFavorites(user?.uid);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  // Simulate initial tracks loading
  useEffect(() => {
    const t = setTimeout(() => setTracksLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const filtered = ALL_TRACKS.filter((t) => {
    if (activeTab === "Favorites" && !favorites.includes(t.id)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.artist.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="channel-root">
      {/* Header */}
      <header className="channel-header">
        <div className="channel-header-left">
          <span className="channel-logo">🎵</span>
          <span className="channel-brand">Music Channel</span>
        </div>
        <div className="channel-header-right">
          <span className="channel-user-email">{user?.email}</span>
          <button className="channel-signout" onClick={() => signOut(auth)}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="channel-hero">
        <h1 className="channel-hero-title">Your Music Universe</h1>
        <p className="channel-hero-sub">Discover, save favorites, and explore your channels</p>
        <input
          className="channel-search"
          type="text"
          placeholder="Search tracks or artists…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="channel-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`channel-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Favorites" && favorites.length > 0 && (
              <span className="channel-tab-count">{favorites.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <main className="channel-grid-wrap">
        {tracksLoading ? (
          <div className="channel-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="channel-empty">
            {activeTab === "Favorites"
              ? "❤️ No favorites yet — click the heart on any track!"
              : "No tracks found."}
          </div>
        ) : (
          <div className="channel-grid">
            {filtered.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isFavorite={favorites.includes(track.id)}
                onToggleFavorite={toggle}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
