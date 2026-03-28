import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

export type AppMode = 'free' | 'ai';
export type FontSize = 'normal' | 'large';

interface AppState {
  mode: AppMode;
  apiKey: string;
  theme: 'light' | 'dark';
  fontSize: FontSize;
  showSettings: boolean;
  regionId: string;
}

type AppAction =
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_FONT_SIZE'; payload: FontSize }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'SET_REGION'; payload: string };

const initialState: AppState = {
  mode: 'free',
  apiKey: '',
  theme: 'light',
  fontSize: 'normal',
  showSettings: false,
  regionId: 'london',
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'CLOSE_SETTINGS':
      return { ...state, showSettings: false };
    case 'SET_REGION':
      return { ...state, regionId: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('11plus_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...init, ...parsed, showSettings: false };
      }
    } catch {}
    return init;
  });

  useEffect(() => {
    const { showSettings, ...toSave } = state;
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

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
