import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  hsvToRgb,
  rgbToHsv,
  hsvToHex,
  isLightColor,
  isInkPixel,
  INK_THRESHOLD,
  CLASSIC_PALETTE,
  ALL_PALETTES,
} from "../lib/colors";

describe("Color Utilities", () => {
  describe("hexToRgb", () => {
    it("converts black correctly", () => {
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("converts white correctly", () => {
      expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("converts red correctly", () => {
      expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("converts ColorInk primary correctly", () => {
      expect(hexToRgb("#FF3366")).toEqual({ r: 255, g: 51, b: 102 });
    });

    it("returns null for invalid hex", () => {
      expect(hexToRgb("invalid")).toBeNull();
    });
  });

  describe("rgbToHex", () => {
    it("converts black correctly", () => {
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
    });

    it("converts white correctly", () => {
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    });

    it("converts red correctly", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    });
  });

  describe("hsvToRgb", () => {
    it("converts pure red (hue=0)", () => {
      const { r, g, b } = hsvToRgb(0, 1, 1);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });

    it("converts white (saturation=0)", () => {
      const { r, g, b } = hsvToRgb(0, 0, 1);
      expect(r).toBe(255);
      expect(g).toBe(255);
      expect(b).toBe(255);
    });

    it("converts black (value=0)", () => {
      const { r, g, b } = hsvToRgb(0, 0, 0);
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });
  });

  describe("hsvToHex", () => {
    it("produces valid hex string", () => {
      const hex = hsvToHex(0.5, 0.8, 0.9);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe("isLightColor", () => {
    it("identifies white as light", () => {
      expect(isLightColor("#FFFFFF")).toBe(true);
    });

    it("identifies black as dark", () => {
      expect(isLightColor("#000000")).toBe(false);
    });

    it("identifies yellow as light", () => {
      expect(isLightColor("#FFFF00")).toBe(true);
    });

    it("identifies dark blue as dark", () => {
      expect(isLightColor("#000080")).toBe(false);
    });
  });

  describe("isInkPixel", () => {
    it("identifies very dark pixels as ink", () => {
      expect(isInkPixel(10, 10, 10)).toBe(true);
    });

    it("identifies black as ink", () => {
      expect(isInkPixel(0, 0, 0)).toBe(true);
    });

    it("identifies white as non-ink", () => {
      expect(isInkPixel(255, 255, 255)).toBe(false);
    });

    it("identifies light gray as non-ink", () => {
      expect(isInkPixel(200, 200, 200)).toBe(false);
    });

    it("uses correct threshold", () => {
      // Pixel at exactly threshold should be non-ink
      const atThreshold = INK_THRESHOLD;
      const brightness = atThreshold;
      expect(isInkPixel(brightness, brightness, brightness)).toBe(false);
    });
  });
});

describe("Color Palettes", () => {
  it("classic palette has 36 colors", () => {
    expect(CLASSIC_PALETTE.colors).toHaveLength(36);
  });

  it("all palette colors are valid hex", () => {
    for (const palette of ALL_PALETTES) {
      for (const color of palette.colors) {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it("all palettes have required fields", () => {
    for (const palette of ALL_PALETTES) {
      expect(palette.id).toBeTruthy();
      expect(palette.name).toBeTruthy();
      expect(palette.colors.length).toBeGreaterThan(0);
    }
  });

  it("classic palette is not premium", () => {
    expect(CLASSIC_PALETTE.isPremium).toBeFalsy();
  });

  it("has 5 palettes total", () => {
    expect(ALL_PALETTES).toHaveLength(5);
  });
});
