import { createContext, useContext } from "react";
import {
  DEFAULT_AI_MODEL,
  DEFAULT_AI_PROVIDER,
  type AiProviderId,
} from "../api/aiCatalog";

export type AppMode = "free" | "ai";
export type FontSize = "normal" | "large";

export interface AppState {
  mode: AppMode;
  aiProvider: AiProviderId;
  aiModel: string;
  aiAccessCode: string;
  theme: "light" | "dark";
  fontSize: FontSize;
  showSettings: boolean;
  regionId: string;
}

export type AppAction =
  | { type: "SET_MODE"; payload: AppMode }
  | { type: "SET_AI_PROVIDER"; payload: AiProviderId }
  | { type: "SET_AI_MODEL"; payload: string }
  | { type: "SET_AI_ACCESS_CODE"; payload: string }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_FONT_SIZE"; payload: FontSize }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "CLOSE_SETTINGS" }
  | { type: "SET_REGION"; payload: string };

export const initialState: AppState = {
  mode: "free",
  aiProvider: DEFAULT_AI_PROVIDER,
  aiModel: DEFAULT_AI_MODEL,
  aiAccessCode: "",
  theme: "light",
  fontSize: "normal",
  showSettings: false,
  regionId: "london",
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_AI_PROVIDER":
      return { ...state, aiProvider: action.payload };
    case "SET_AI_MODEL":
      return { ...state, aiModel: action.payload };
    case "SET_AI_ACCESS_CODE":
      return { ...state, aiAccessCode: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.payload };
    case "TOGGLE_SETTINGS":
      return { ...state, showSettings: !state.showSettings };
    case "CLOSE_SETTINGS":
      return { ...state, showSettings: false };
    case "SET_REGION":
      return { ...state, regionId: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
