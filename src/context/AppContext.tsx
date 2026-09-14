import { useEffect, useReducer, type ReactNode } from "react";
import {
  DEFAULT_AI_MODEL,
  DEFAULT_AI_PROVIDER,
  getAiProvider,
  isAllowedAiModel,
} from "../api/aiCatalog";
import { AppContext, appReducer, initialState } from "./appState";

const SETTINGS_STORAGE_KEY = "11plus_app_settings";
const API_KEY_SESSION_STORAGE_KEY = "11plus_api_key";
const ACCESS_CODE_SESSION_STORAGE_KEY = "11plus_ai_access_code";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    let persistedSettings = {};
    let aiAccessCode = "";

    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deliberately remove keys persisted by older releases.
        delete parsed.apiKey;
        const provider =
          getAiProvider(parsed.aiProvider)?.id ?? DEFAULT_AI_PROVIDER;
        parsed.aiProvider = provider;
        parsed.aiModel = isAllowedAiModel(provider, parsed.aiModel)
          ? parsed.aiModel
          : provider === DEFAULT_AI_PROVIDER
            ? DEFAULT_AI_MODEL
            : getAiProvider(provider)?.models[0].id;
        persistedSettings = parsed;
      }
    } catch {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }

    try {
      // Remove browser-held credentials from releases before the secure backend.
      sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
      aiAccessCode =
        sessionStorage.getItem(ACCESS_CODE_SESSION_STORAGE_KEY) ?? "";
    } catch {
      // Storage may be unavailable in strict private-browsing modes.
    }

    return {
      ...init,
      ...persistedSettings,
      aiAccessCode,
      showSettings: false,
    };
  });

  useEffect(() => {
    const toSave = {
      mode: state.mode,
      theme: state.theme,
      fontSize: state.fontSize,
      regionId: state.regionId,
      aiProvider: state.aiProvider,
      aiModel: state.aiModel,
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toSave));
  }, [
    state.mode,
    state.theme,
    state.fontSize,
    state.regionId,
    state.aiProvider,
    state.aiModel,
  ]);

  useEffect(() => {
    try {
      if (state.aiAccessCode) {
        sessionStorage.setItem(
          ACCESS_CODE_SESSION_STORAGE_KEY,
          state.aiAccessCode,
        );
      } else {
        sessionStorage.removeItem(ACCESS_CODE_SESSION_STORAGE_KEY);
      }
    } catch {
      // The code still works for the current page when storage is unavailable.
    }
  }, [state.aiAccessCode]);

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
