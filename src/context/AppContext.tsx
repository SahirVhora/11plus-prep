import { useEffect, useReducer, type ReactNode } from 'react';
import { AppContext, appReducer, initialState } from './appState';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('11plus_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...init, ...parsed, showSettings: false };
      }
    } catch {
      localStorage.removeItem('11plus_app_settings');
    }
    return init;
  });

  useEffect(() => {
    const toSave = {
      mode: state.mode,
      apiKey: state.apiKey,
      theme: state.theme,
      fontSize: state.fontSize,
      regionId: state.regionId,
    };
    localStorage.setItem('11plus_app_settings', JSON.stringify(toSave));
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
