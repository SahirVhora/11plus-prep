import { useEffect, useReducer, type ReactNode } from "react";
import { AppContext, appReducer, initialState } from "./appState";

const SETTINGS_STORAGE_KEY = "11plus_app_settings";
const API_KEY_SESSION_STORAGE_KEY = "11plus_api_key";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    let persistedSettings = {};

    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deliberately remove keys persisted by older releases.
        delete parsed.apiKey;
        persistedSettings = parsed;
      }
    } catch {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }

    let sessionApiKey = "";
    try {
      sessionApiKey = sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY) || "";
    } catch {
      sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
    }

    return {
      ...init,
      ...persistedSettings,
      apiKey: sessionApiKey,
      showSettings: false,
    };
  });

  useEffect(() => {
    const toSave = {
      mode: state.mode,
      theme: state.theme,
      fontSize: state.fontSize,
      regionId: state.regionId,
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toSave));
  }, [state.mode, state.theme, state.fontSize, state.regionId]);

  useEffect(() => {
    if (state.apiKey) {
      sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, state.apiKey);
    } else {
      sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
    }
  }, [state.apiKey]);

  useEffect(() => {
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.theme]);

  useEffect(() => {
    if (state.fontSize === "large") {
      document.documentElement.style.fontSize = "18px";
    } else {
      document.documentElement.style.fontSize = "16px";
    }
  }, [state.fontSize]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
