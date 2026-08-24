import React from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import ChannelGrid from "./pages/ChannelGrid";
import { firebaseReady } from "./firebase";

function AppRoutes() {
  const user = useAuth();

  if (user === undefined) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f0f1a,#1a0a2e,#0a1628)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}>
        Loading...
      </div>
    );
  }

  if (!firebaseReady) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f0f1a,#1a0a2e,#0a1628)",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ marginBottom: 12 }}>Firebase config is missing</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
            Open <code>music-app/src/firebase.js</code> and replace the
            <code>YOUR_*</code> values with the Web app config from
            Firebase Console &gt; Project settings &gt; Your apps.
          </p>
          <p style={{ color: "rgba(255,255,255,0.75)" }}>
            Also make sure Authentication &gt; Sign-in method &gt; Email/Password is enabled.
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <ChannelGrid />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
