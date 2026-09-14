import { useApp } from "../../context/appState";
import { useWeakAreas } from "../../hooks/useWeakAreas";

export function SettingsModal() {
  const { state, dispatch } = useApp();
  const { clearHistory } = useWeakAreas();

  if (!state.showSettings) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <h2
            id="settings-title"
            className="text-xl font-bold text-primary dark:text-blue-300"
          >
            Settings
          </h2>
          <button
            onClick={() => dispatch({ type: "CLOSE_SETTINGS" })}
            aria-label="Close settings"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">
              Mode
            </label>
            <div className="flex gap-3">
              {(["free", "ai"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => dispatch({ type: "SET_MODE", payload: m })}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm border-2 transition-colors ${
                    state.mode === m
                      ? "border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20"
                      : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-300"
                  }`}
                >
                  {m === "free" ? "🔒 Free Mode" : "✨ AI Mode"}
                </button>
              ))}
            </div>
          </div>

          {/* Secure AI note */}
          {state.mode === "ai" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/20">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Keys stay on the secure server
              </p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-400">
                This browser never asks for or stores provider API keys. Choose
                an available provider on the Practice screen.
              </p>
            </div>
          )}

          {/* Theme */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">
              Theme
            </label>
            <div className="flex gap-3">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => dispatch({ type: "SET_THEME", payload: t })}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm border-2 transition-colors ${
                    state.theme === t
                      ? "border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20"
                      : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {t === "light" ? "☀️ Light" : "🌙 Dark"}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">
              Text Size
            </label>
            <div className="flex gap-3">
              {(["normal", "large"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() =>
                    dispatch({ type: "SET_FONT_SIZE", payload: f })
                  }
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold border-2 transition-colors ${
                    state.fontSize === f
                      ? "border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20"
                      : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400"
                  } ${f === "large" ? "text-base" : "text-sm"}`}
                >
                  {f === "normal" ? "Normal" : "Large"}
                </button>
              ))}
            </div>
          </div>

          {/* Clear history */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={() => {
                clearHistory();
                alert("Practice history cleared.");
              }}
              className="text-sm text-red-500 hover:text-red-700 font-semibold underline"
            >
              Clear practice history & weak areas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
