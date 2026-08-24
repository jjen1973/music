import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.?/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">🎵</span>
          <h1 className="login-title">Music Channel</h1>
        </div>

        <h2 className="login-heading">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
        <p className="login-sub">
          {isSignUp
            ? "Sign up to save favorites and access your channel"
            : "Sign in to your music channel"}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Email</label>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label className="login-label">Password</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="login-toggle">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            className="login-toggle-btn"
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
