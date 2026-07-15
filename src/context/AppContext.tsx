import { useEffect, useReducer, type ReactNode } from 'react';
import { AppContext, appReducer, initialState } from './appState';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('11plus_app_settings');
      const apiKey = sessionStorage.getItem('11plus_anthropic_api_key') || '';
      if (saved) {
        const parsed = JSON.parse(saved);
        // Do not migrate old persisted keys: a secret must not survive a browser session.
        delete parsed.apiKey;
        return { ...init, ...parsed, apiKey, showSettings: false };
      }
      return { ...init, apiKey };
    } catch {
      localStorage.removeItem('11plus_app_settings');
    }
    return init;
  });

  useEffect(() => {
    const toSave = {
      mode: state.mode,
      theme: state.theme,
      fontSize: state.fontSize,
      regionId: state.regionId,
    };
    localStorage.setItem('11plus_app_settings', JSON.stringify(toSave));
    if (state.apiKey) {
      sessionStorage.setItem('11plus_anthropic_api_key', state.apiKey);
    } else {
      sessionStorage.removeItem('11plus_anthropic_api_key');
    }
  }, [state]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  useEffect(() => {
    if (state.fontSize === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [state.fontSize]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
