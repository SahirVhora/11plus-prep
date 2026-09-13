import { Link } from "react-router-dom";
import { useApp } from "../../context/appState";

export function Header() {
  const { dispatch } = useApp();

  return (
    <header className="journey-header">
      <div className="journey-container header-inner">
        {/* Logo */}
        <Link
          to="/"
          className="journey-logo"
          aria-label="Grammar Journey - Today"
        >
          <span className="logo-mark" aria-hidden="true">
            G
          </span>
          <span>
            Grammar <em>Journey</em>
          </span>
        </Link>

        {/* Nav */}
        <nav className="journey-nav" aria-label="Main navigation">
          <Link to="/">Today</Link>
          <Link to="/journey">Year Journey</Link>
          <Link to="/quiz">Practice</Link>
          <Link to="/parent">Parent Desk</Link>
        </nav>

        {/* Controls */}
        <div className="header-controls">
          <button
            onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
            aria-label="Open settings"
            className="settings-button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
