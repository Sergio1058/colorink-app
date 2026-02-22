// ─── Color Utilities ──────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function hsvToRgb(
  h: number,
  s: number,
  v: number
): { r: number; g: number; b: number } {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  isPremium?: boolean;
  unlockType?: "rewarded_ad";
}

export const CLASSIC_PALETTE: ColorPalette = {
  id: "classic",
  name: "Clásica",
  colors: [
    // Reds & Pinks
    "#FF0000", "#FF3366", "#FF69B4", "#FF1493",
    // Oranges
    "#FF6600", "#FF8C00", "#FFA500", "#FFD700",
    // Yellows & Greens
    "#FFFF00", "#ADFF2F", "#00FF00", "#32CD32",
    // Teals & Blues
    "#00CED1", "#00BFFF", "#0080FF", "#0000FF",
    // Purples & Violets
    "#8B00FF", "#9400D3", "#EE82EE", "#FF00FF",
    // Browns & Earth
    "#8B4513", "#A0522D", "#D2691E", "#F4A460",
    // Neutrals
    "#FFFFFF", "#F5F5F5", "#D3D3D3", "#808080",
    "#404040", "#1A1A1A", "#000000", "#8B0000",
    // Skin tones
    "#FFDAB9", "#DEB887", "#D2B48C", "#C19A6B",
  ],
};

export const MURAKAMI_PALETTE: ColorPalette = {
  id: "murakami",
  name: "Murakami Pop",
  colors: [
    "#FF3366", "#FF6699", "#FF99CC", "#FFCCEE",
    "#FF6600", "#FF9900", "#FFCC00", "#FFFF00",
    "#99FF00", "#33FF00", "#00FF99", "#00FFFF",
    "#0099FF", "#0033FF", "#6600FF", "#CC00FF",
    "#FF00CC", "#FF0066", "#FFFFFF", "#000000",
    "#FFD700", "#FF4500", "#7CFC00", "#00CED1",
    "#FF69B4", "#9370DB", "#20B2AA", "#FF8C00",
    "#00FA9A", "#FF1493", "#1E90FF", "#DC143C",
    "#ADFF2F", "#FF7F50", "#DA70D6", "#40E0D0",
  ],
  isPremium: false,
};

export const NEON_PALETTE: ColorPalette = {
  id: "neon",
  name: "Neon Tokyo",
  colors: [
    "#FF0080", "#FF00FF", "#8000FF", "#0000FF",
    "#00FFFF", "#00FF80", "#80FF00", "#FFFF00",
    "#FF8000", "#FF0000", "#FF40FF", "#40FFFF",
    "#40FF40", "#FFFF40", "#FF8040", "#4080FF",
    "#FF4080", "#80FF80", "#8080FF", "#FFFF80",
    "#FF80FF", "#80FFFF", "#C0FF00", "#FF00C0",
    "#00FFC0", "#C000FF", "#FF6000", "#0060FF",
    "#60FF00", "#FF0060", "#00FF60", "#6000FF",
    "#FFFFFF", "#000000", "#202020", "#404040",
  ],
  isPremium: true,
  unlockType: "rewarded_ad",
};

export const PASTEL_PALETTE: ColorPalette = {
  id: "pastel",
  name: "Pastel Dreams",
  colors: [
    "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9",
    "#BAE1FF", "#E8BAFF", "#FFBAE8", "#FFD9BA",
    "#D9FFBA", "#BAD9FF", "#F9BAFF", "#BAFFF9",
    "#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF",
    "#CDB4DB", "#FFC8DD", "#FFAFCC", "#BDE0FE",
    "#E9C46A", "#F4A261", "#E76F51", "#264653",
    "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51",
    "#FFDDD2", "#E8E8E4", "#D8E2DC", "#ECE4DB",
    "#FFFFFF", "#F8F8F8", "#EEEEEE", "#DDDDDD",
  ],
  isPremium: true,
  unlockType: "rewarded_ad",
};

export const JAPANESE_PALETTE: ColorPalette = {
  id: "japanese",
  name: "Japonés Tradicional",
  colors: [
    "#C62828", "#AD1457", "#6A1B9A", "#283593",
    "#1565C0", "#00695C", "#2E7D32", "#F57F17",
    "#E65100", "#BF360C", "#4E342E", "#37474F",
    "#E91E63", "#9C27B0", "#3F51B5", "#2196F3",
    "#009688", "#4CAF50", "#FF9800", "#FF5722",
    "#795548", "#607D8B", "#F8BBD9", "#CE93D8",
    "#9FA8DA", "#80DEEA", "#A5D6A7", "#FFF176",
    "#FFCC80", "#FFAB91", "#D7CCC8", "#B0BEC5",
    "#FFFFFF", "#FAFAFA", "#212121", "#000000",
  ],
  isPremium: true,
  unlockType: "rewarded_ad",
};

export const ALL_PALETTES: ColorPalette[] = [
  CLASSIC_PALETTE,
  MURAKAMI_PALETTE,
  NEON_PALETTE,
  PASTEL_PALETTE,
  JAPANESE_PALETTE,
];

// ─── Color Contrast ───────────────────────────────────────────────────────────

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const { r, g, b } = rgb;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.5;
}

// ─── Outline Detection ────────────────────────────────────────────────────────

// Threshold: pixels darker than this are considered "ink/outline" and should not be colored
export const INK_THRESHOLD = 80; // 0-255, lower = only very dark pixels protected

export function isInkPixel(r: number, g: number, b: number): boolean {
  // A pixel is "ink" if it's dark enough (part of the outline)
  const brightness = (r + g + b) / 3;
  return brightness < INK_THRESHOLD;
}
