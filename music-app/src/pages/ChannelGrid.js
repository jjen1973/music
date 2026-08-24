import React, { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import TrackCard from "../components/TrackCard";
import SkeletonCard from "../components/SkeletonCard";
import "./ChannelGrid.css";

// Your 5 source tracks
const ALL_TRACKS = [
  { id: "bang-the-drum",    title: "Bang the Drum",       artist: "Session Artist",  genre: "Rock",       duration: "3:42", isNew: true,  audioSrc: "/audio/bang-the-drum.mp3", artwork: "/artwork/gc_front_gal.jpg" },
  { id: "one-more-sunrise", title: "One More Sunrise",    artist: "Morning Crew",    genre: "Pop",        duration: "4:15", isNew: false, audioSrc: "/audio/one-more-sunrise.mp3", artwork: "/artwork/grybus_wildsam.jpg" },
  { id: "paper-map-summit", title: "Paper Map Summit",    artist: "The Wanderers",   genre: "Country",    duration: "3:58", isNew: false, audioSrc: "/audio/paper-map-summit.mp3", artwork: "/artwork/abstract-2.png" },
  { id: "receipt-queen",    title: "Receipt Queen",       artist: "Urban Stories",   genre: "Electronic", duration: "3:21", isNew: true,  audioSrc: "/audio/receipt-queen.mp3", artwork: "/artwork/cash-register.jpg" },
  { id: "red-hand-mark",    title: "Red Hand Mark",       artist: "Dark Matter",     genre: "Rock",       duration: "4:02", isNew: false, audioSrc: "/audio/red-hand-mark.mp3", artwork: "/logo192.png" },
];

const TABS = ["All", "Favorites"];

export default function ChannelGrid() {
  const user = useAuth();
  const userKey = user?.uid;
  const { favorites, toggle } = useFavorites(userKey);
  const audioRef = useRef(null);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulate initial tracks loading
  useEffect(() => {
    const t = setTimeout(() => setTracksLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const handlePlayTrack = async (track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
      return;
    }

    setCurrentTrack(track);
    audio.src = track.audioSrc;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
    }
  };

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
                isPlaying={currentTrack?.id === track.id && isPlaying}
                onPlayTrack={handlePlayTrack}
              />
            ))}
          </div>
        )}
      </main>

      <audio ref={audioRef} preload="none" />

      {currentTrack && (
        <div className="channel-player">
          <div>
            <div className="channel-player-label">Now playing</div>
            <div className="channel-player-title">{currentTrack.title}</div>
          </div>
          <button
            className="channel-player-btn"
            onClick={() => handlePlayTrack(currentTrack)}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </div>
  );
}
