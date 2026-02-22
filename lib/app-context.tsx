import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  AppSettings,
  ColoredWork,
  loadColoredWorks,
  loadSettings,
  saveSettings,
} from "./store";

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  settings: AppSettings;
  coloredWorks: ColoredWork[];
  isLoaded: boolean;
}

const initialState: AppState = {
  settings: {
    coverImageUri: null,
    theme: "system",
    zenModeEnabled: false,
    soundEnabled: true,
    adsCount: 0,
    worksCompleted: 0,
    totalColoringMinutes: 0,
    favoriteColors: [],
    unlockedPalettes: ["classic"],
  },
  coloredWorks: [],
  isLoaded: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "LOAD_DATA"; settings: AppSettings; coloredWorks: ColoredWork[] }
  | { type: "UPDATE_SETTINGS"; settings: Partial<AppSettings> }
  | { type: "ADD_COLORED_WORK"; work: ColoredWork }
  | { type: "REMOVE_COLORED_WORK"; id: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_DATA":
      return {
        ...state,
        settings: action.settings,
        coloredWorks: action.coloredWorks,
        isLoaded: true,
      };
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    case "ADD_COLORED_WORK": {
      const existing = state.coloredWorks.findIndex((w) => w.id === action.work.id);
      if (existing >= 0) {
        const updated = [...state.coloredWorks];
        updated[existing] = action.work;
        return { ...state, coloredWorks: updated };
      }
      return { ...state, coloredWorks: [action.work, ...state.coloredWorks] };
    }
    case "REMOVE_COLORED_WORK":
      return {
        ...state,
        coloredWorks: state.coloredWorks.filter((w) => w.id !== action.id),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  addColoredWork: (work: ColoredWork) => void;
  removeColoredWork: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function loadData() {
      const [settings, coloredWorks] = await Promise.all([
        loadSettings(),
        loadColoredWorks(),
      ]);
      dispatch({ type: "LOAD_DATA", settings, coloredWorks });
    }
    loadData();
  }, []);

  const updateSettings = async (settings: Partial<AppSettings>) => {
    dispatch({ type: "UPDATE_SETTINGS", settings });
    await saveSettings(settings);
  };

  const addColoredWork = (work: ColoredWork) => {
    dispatch({ type: "ADD_COLORED_WORK", work });
  };

  const removeColoredWork = (id: string) => {
    dispatch({ type: "REMOVE_COLORED_WORK", id });
  };

  return (
    <AppContext.Provider value={{ state, updateSettings, addColoredWork, removeColoredWork }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
