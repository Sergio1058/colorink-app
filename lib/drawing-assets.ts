// Map of drawing asset IDs to their require() calls
// This is necessary because React Native's bundler needs static require() paths

export const DRAWING_ASSETS: Record<string, number> = {
  flower: require("../assets/drawings/flower.png"),
  koi: require("../assets/drawings/koi.png"),
  mushroom: require("../assets/drawings/mushroom.png"),
};

export function getDrawingAsset(id: string): number | null {
  return DRAWING_ASSETS[id] ?? null;
}
