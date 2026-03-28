import { Link } from 'react-router-dom';
import { ModeToggle } from './ModeToggle';
import { useApp } from '../../context/AppContext';
import { useRegion } from '../../hooks/useRegion';

export function Header() {
  const { dispatch } = useApp();
  const { region } = useRegion();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold text-xl text-primary dark:text-blue-300 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
          aria-label="11Plus Prep — Home"
        >
          <span className="text-2xl" aria-hidden="true">🎓</span>
          <span>11Plus<span className="text-secondary">Prep</span></span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-6" aria-label="Main navigation">
          <Link to="/" className="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-300 transition-colors">Home</Link>
          <Link to="/quiz" className="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-300 transition-colors">Practice</Link>
          <Link to="/about" className="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-300 transition-colors">About 11+</Link>
        </nav>

        {/* Region pill */}
        <Link
          to="/quiz"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
          title="Change region"
        >
          <span aria-hidden="true">{region.flag}</span>
          <span>{region.shortName}</span>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            aria-label="Open settings"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <Link
            to="/quiz"
            className="hidden sm:inline-flex btn-primary text-sm py-2 px-4"
          >
            Practice Now
          </Link>
        </div>
      </div>
    </header>
  );
}
