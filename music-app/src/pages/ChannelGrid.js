import React, { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import TrackCard from "../components/TrackCard";
import SkeletonCard from "../components/SkeletonCard";
import "./ChannelGrid.css";

// Your source tracks
const ALL_TRACKS = [
  { id: "bang-the-drum",    title: "Bang the Drum",       artist: "Jen",  genre: "Rock",       duration: "3:42", isNew: true,  audioSrc: "/audio/bang-the-drum.mp3", artwork: "/artwork/gc_front_gal.jpg" },
  { id: "one-more-sunrise", title: "One More Sunrise",    artist: "Jen",  genre: "Pop",        duration: "4:15", isNew: false, audioSrc: "/audio/one-more-sunrise.mp3", artwork: "/artwork/grybus_wildsam.jpg" },
  { id: "paper-map-summit", title: "Paper Map Summit",    artist: "Jen",  genre: "Country",    duration: "3:58", isNew: false, audioSrc: "/audio/paper-map-summit.mp3", artwork: "/artwork/abstract-2.png" },
  { id: "receipt-queen",    title: "Receipt Queen",       artist: "Jen",  genre: "Electronic", duration: "3:21", isNew: true,  audioSrc: "/audio/receipt-queen.mp3", artwork: "/artwork/cash-register.jpg" },
  { id: "get-a-bird",       title: "Get A Bird",          artist: "Jen",  genre: "Indie",      duration: "3:46", isNew: true,  audioSrc: "/audio/Get%20A%20Bird.mp3", artwork: "/artwork/sun-conure-parrot.jpg" },
  { id: "im-not-done-yet",  title: "I'm Not Done Yet",    artist: "Jen",  genre: "Alternative", duration: "4:11", isNew: true,  audioSrc: "/audio/Im%20not%20done%20yet.mp3", artwork: "/artwork/im-not-done-yet-cover.png" },
  { id: "paper-cup-moon",   title: "Paper Cup Moon",      artist: "Jen",  genre: "Folk",       duration: "4:08", isNew: true,  audioSrc: "/audio/Paper%20Cup%20Moon.mp3", artwork: "/artwork/paper-cup-moon-1.png" },
  { id: "red-hand-mark",    title: "Red Hand Mark",       artist: "Jen",  genre: "Rock",       duration: "4:02", isNew: false, audioSrc: "/audio/red-hand-mark.mp3", artwork: "/artwork/red-hand-separate.png" },
];

const TABS = ["All", "Favorites"];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
}

function getTrackByOffset(track, offset) {
  const index = ALL_TRACKS.findIndex((item) => item.id === track.id);
  if (index === -1) return ALL_TRACKS[0];
  return ALL_TRACKS[(index + offset + ALL_TRACKS.length) % ALL_TRACKS.length];
}

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
  const [continuePlay, setContinuePlay] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Simulate initial tracks loading
  useEffect(() => {
    const t = setTimeout(() => setTracksLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        setPlayerProgress(0);
        setTrackDuration(0);
        setCurrentTime(0);
        return;
      }

      setTrackDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setPlayerProgress(audio.currentTime / audio.duration);
    };

    const handlePlayState = () => setIsPlaying(!audio.paused);
    const handleEnded = async () => {
      if (!currentTrack || !continuePlay) {
        setIsPlaying(false);
        setPlayerProgress(0);
        setCurrentTime(0);
        return;
      }

      const nextTrack = getTrackByOffset(currentTrack, 1);
      setCurrentTrack(nextTrack);
      audio.src = nextTrack.audioSrc;
      audio.currentTime = 0;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("play", handlePlayState);
    audio.addEventListener("pause", handlePlayState);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("play", handlePlayState);
      audio.removeEventListener("pause", handlePlayState);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [continuePlay, currentTrack]);

  const progressPercent = Math.max(0, Math.min(playerProgress * 100, 100));

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
    setPlayerProgress(0);
    setCurrentTime(0);
    setTrackDuration(0);
    audio.src = track.audioSrc;
    audio.currentTime = 0;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
    setCurrentTime(audio.currentTime);
    setPlayerProgress(audio.currentTime / audio.duration);
  };

  const handleNextTrack = async () => {
    if (!currentTrack) return;
    const nextTrack = getTrackByOffset(currentTrack, 1);
    await handlePlayTrack(nextTrack);
  };

  const handlePrevTrack = async () => {
    if (!currentTrack) return;
    const prevTrack = getTrackByOffset(currentTrack, -1);
    await handlePlayTrack(prevTrack);
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
          <div className="channel-player-track">
            <img className="channel-player-art" src={currentTrack.artwork} alt="" aria-hidden="true" />
            <div className="channel-player-info">
              <div className="channel-player-label">Now playing</div>
              <div className="channel-player-title">{currentTrack.title}</div>
            </div>
          </div>

          <div
            className="channel-player-progress"
            onClick={handleSeek}
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
          >
            <span className="channel-player-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="channel-player-time">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(trackDuration)}</span>
          </div>

          <div className="channel-player-controls">
            <button className="channel-player-mini-btn" onClick={handlePrevTrack} title="Previous song">
              ⏮
            </button>
            <button
              className="channel-player-btn"
              onClick={() => handlePlayTrack(currentTrack)}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button className="channel-player-mini-btn" onClick={handleNextTrack} title="Next song">
              ⏭
            </button>
          </div>

          <button
            className={`channel-player-toggle ${continuePlay ? "active" : ""}`}
            onClick={() => setContinuePlay((value) => !value)}
            title={continuePlay ? "Turn off auto play" : "Turn on auto play"}
            aria-pressed={continuePlay}
          >
            <span className="channel-player-toggle-track">
              <span className="channel-player-toggle-thumb" />
            </span>
            <span className="channel-player-toggle-label">{continuePlay ? "Auto" : "Off"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
