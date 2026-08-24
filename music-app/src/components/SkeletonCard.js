import React from "react";
import "./SkeletonCard.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-thumb">
        <span className="skeleton" />
      </div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-line wide" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line narrow" />
      </div>
    </div>
  );
}
