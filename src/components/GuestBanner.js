"use client";

export default function GuestBanner({ onSignIn }) {
  return (
    <div className="guest-banner">
      <div className="guest-banner-text">
        <strong>👋 You're in guest mode</strong>
        Your todos are saved locally. Sign in to sync across devices!
      </div>
      <button className="btn btn-secondary" onClick={onSignIn}>
        Sign In
      </button>
    </div>
  );
}
