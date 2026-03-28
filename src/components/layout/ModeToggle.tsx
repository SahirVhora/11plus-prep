import { useApp } from '../../context/AppContext';

export function ModeToggle() {
  const { state, dispatch } = useApp();
  const isAI = state.mode === 'ai';

  const toggle = () => {
    dispatch({ type: 'SET_MODE', payload: isAI ? 'free' : 'ai' });
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Mode selector">
      <span className={`text-sm font-semibold ${!isAI ? 'text-primary dark:text-blue-300' : 'text-gray-400'}`}>
        Free
      </span>
      <button
        onClick={toggle}
        role="switch"
        aria-checked={isAI}
        aria-label={`Switch to ${isAI ? 'Free' : 'AI'} mode`}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
          isAI ? 'bg-secondary' : 'bg-gray-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
            isAI ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-sm font-semibold ${isAI ? 'text-secondary' : 'text-gray-400'}`}>
        AI ✨
      </span>
    </div>
  );
}
