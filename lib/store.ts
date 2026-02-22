import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Drawing {
  id: string;
  title: string;
  description: string;
  imageAsset: string; // require() key or file URI
  difficulty: "easy" | "medium" | "hard";
  isDaily?: boolean;
  dailyDate?: string;
  isLocked?: boolean;
  unlockType?: "rewarded_ad" | "premium";
}

export interface ColoredWork {
  id: string;
  drawingId: string;
  drawingTitle: string;
  colorData: string; // JSON string of pixel color map
  completedAt: string;
  thumbnailUri?: string;
}

export interface AppSettings {
  coverImageUri: string | null; // null = use default
  theme: "light" | "dark" | "system";
  zenModeEnabled: boolean;
  soundEnabled: boolean;
  adsCount: number; // track how many interstitials shown
  worksCompleted: number;
  totalColoringMinutes: number;
  favoriteColors: string[];
  unlockedPalettes: string[];
}

// ─── Default Data ─────────────────────────────────────────────────────────────

export const BUILT_IN_DRAWINGS: Drawing[] = [
  {
    id: "flower",
    title: "Flor Murakami",
    description: "Una flor sonriente llena de patrones geométricos y elementos pop art",
    imageAsset: "flower",
    difficulty: "easy",
  },
  {
    id: "koi",
    title: "Koi Japonés",
    description: "Dos carpas koi en un remolino de agua con flores de cerezo",
    imageAsset: "koi",
    difficulty: "hard",
  },
  {
    id: "mushroom",
    title: "Bosque de Setas",
    description: "Un bosque mágico con setas kawaii y criaturas sonrientes",
    imageAsset: "mushroom",
    difficulty: "medium",
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  coverImageUri: null,
  theme: "system",
  zenModeEnabled: false,
  soundEnabled: true,
  adsCount: 0,
  worksCompleted: 0,
  totalColoringMinutes: 0,
  favoriteColors: [],
  unlockedPalettes: ["classic"],
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  SETTINGS: "@colorink/settings",
  COLORED_WORKS: "@colorink/colored_works",
  COLORING_PROGRESS: (id: string) => `@colorink/progress/${id}`,
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const current = await loadSettings();
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
  } catch (e) {
    console.error("Error saving settings:", e);
  }
}

// ─── Colored Works ────────────────────────────────────────────────────────────

export async function loadColoredWorks(): Promise<ColoredWork[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.COLORED_WORKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveColoredWork(work: ColoredWork): Promise<void> {
  try {
    const works = await loadColoredWorks();
    const idx = works.findIndex((w) => w.id === work.id);
    if (idx >= 0) {
      works[idx] = work;
    } else {
      works.unshift(work);
    }
    await AsyncStorage.setItem(KEYS.COLORED_WORKS, JSON.stringify(works));
  } catch (e) {
    console.error("Error saving colored work:", e);
  }
}

export async function deleteColoredWork(id: string): Promise<void> {
  try {
    const works = await loadColoredWorks();
    const filtered = works.filter((w) => w.id !== id);
    await AsyncStorage.setItem(KEYS.COLORED_WORKS, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error deleting colored work:", e);
  }
}

// ─── Coloring Progress ────────────────────────────────────────────────────────

export interface ColoringProgress {
  drawingId: string;
  colorMap: Record<string, string>; // zone key -> hex color
  recentColors: string[];
  lastModified: string;
}

export async function loadColoringProgress(drawingId: string): Promise<ColoringProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.COLORING_PROGRESS(drawingId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveColoringProgress(progress: ColoringProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEYS.COLORING_PROGRESS(progress.drawingId),
      JSON.stringify({ ...progress, lastModified: new Date().toISOString() })
    );
  } catch (e) {
    console.error("Error saving coloring progress:", e);
  }
}

export async function clearColoringProgress(drawingId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.COLORING_PROGRESS(drawingId));
  } catch (e) {
    console.error("Error clearing coloring progress:", e);
  }
}
