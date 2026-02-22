import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { hsvToHex, ALL_PALETTES, ColorPalette, isLightColor } from "@/lib/colors";
import { useColors } from "@/hooks/use-colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WHEEL_SIZE = SCREEN_WIDTH * 0.72;
const HALF = WHEEL_SIZE / 2;

// ─── Rainbow Wheel ────────────────────────────────────────────────────────────

interface RainbowWheelProps {
  onColorSelect: (hex: string) => void;
  selectedColor: string;
}

function RainbowWheel({ onColorSelect, selectedColor }: RainbowWheelProps) {
  const [brightness, setBrightness] = useState(1);
  const cursorX = useSharedValue(HALF);
  const cursorY = useSharedValue(HALF);

  const getColorFromPosition = useCallback(
    (x: number, y: number) => {
      const dx = x - HALF;
      const dy = y - HALF;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const r = HALF;
      if (dist > r) return null;

      const angle = Math.atan2(dy, dx);
      const h = ((angle / (2 * Math.PI)) + 1) % 1;
      const s = Math.min(dist / r, 1);
      return hsvToHex(h, s, brightness);
    },
    [brightness]
  );

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const color = getColorFromPosition(e.x, e.y);
    if (color) {
      cursorX.value = e.x;
      cursorY.value = e.y;
      runOnJS(onColorSelect)(color);
    }
  });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const color = getColorFromPosition(e.x, e.y);
      if (color) {
        cursorX.value = e.x;
        cursorY.value = e.y;
        runOnJS(onColorSelect)(color);
      }
    });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  const cursorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cursorX.value - 10 },
      { translateY: cursorY.value - 10 },
    ],
  }));

  // Generate the rainbow wheel using a grid of colored dots
  const dots: { key: string; x: number; y: number; color: string }[] = [];
  const steps = 40;
  for (let xi = 0; xi <= steps; xi++) {
    for (let yi = 0; yi <= steps; yi++) {
      const x = (xi / steps) * WHEEL_SIZE;
      const y = (yi / steps) * WHEEL_SIZE;
      const color = getColorFromPosition(x, y);
      if (color) {
        dots.push({ key: `${xi}-${yi}`, x, y, color });
      }
    }
  }

  return (
    <View style={styles.wheelContainer}>
      <GestureDetector gesture={composedGesture}>
        <View style={[styles.wheel, { width: WHEEL_SIZE, height: WHEEL_SIZE }]}>
          {dots.map((dot) => (
            <View
              key={dot.key}
              style={[
                styles.wheelDot,
                {
                  left: dot.x,
                  top: dot.y,
                  backgroundColor: dot.color,
                },
              ]}
            />
          ))}
          <Animated.View style={[styles.cursor, cursorStyle]} />
        </View>
      </GestureDetector>

      {/* Brightness slider */}
      <View style={styles.brightnessRow}>
        <Text style={styles.brightnessLabel}>Brillo</Text>
        <View style={styles.brightnessTrack}>
          {Array.from({ length: 20 }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.brightnessStep,
                { backgroundColor: `hsl(0,0%,${Math.round((i / 19) * 100)}%)` },
                Math.abs(brightness - i / 19) < 0.03 && styles.brightnessStepActive,
              ]}
              onPress={() => setBrightness(i / 19)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({
  color,
  isSelected,
  onPress,
  size = 36,
}: {
  color: string;
  isSelected: boolean;
  onPress: () => void;
  size?: number;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.swatch,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        isSelected && styles.swatchSelected,
        color === "#FFFFFF" && styles.swatchWhite,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    />
  );
}

// ─── Main Color Picker ────────────────────────────────────────────────────────

interface ColorPickerProps {
  selectedColor: string;
  recentColors: string[];
  unlockedPalettes: string[];
  onColorSelect: (color: string) => void;
  onUnlockPalette: (paletteId: string) => void;
}

type Tab = "palette" | "rainbow" | "recent";

export function ColorPicker({
  selectedColor,
  recentColors,
  unlockedPalettes,
  onColorSelect,
  onUnlockPalette,
}: ColorPickerProps) {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>("palette");
  const [activePaletteId, setActivePaletteId] = useState("classic");

  const activePalette = ALL_PALETTES.find((p) => p.id === activePaletteId) ?? ALL_PALETTES[0];
  const isUnlocked = (p: ColorPalette) => !p.isPremium || unlockedPalettes.includes(p.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {(["palette", "rainbow", "recent"] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: "#FF3366", borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? "#FF3366" : colors.muted }]}>
              {tab === "palette" ? "Paleta" : tab === "rainbow" ? "Arcoíris" : "Recientes"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Palette Selector (shown when tab = palette) */}
      {activeTab === "palette" && (
        <>
          <View style={styles.paletteSelector}>
            {ALL_PALETTES.map((p) => {
              const unlocked = isUnlocked(p);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.palettePill,
                    activePaletteId === p.id && styles.palettePillActive,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => {
                    if (unlocked) {
                      setActivePaletteId(p.id);
                    } else {
                      onUnlockPalette(p.id);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.palettePillText,
                      { color: activePaletteId === p.id ? "#FF3366" : colors.foreground },
                    ]}
                  >
                    {unlocked ? p.name : `🔒 ${p.name}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.swatchGrid}>
            {activePalette.colors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                isSelected={selectedColor === color}
                onPress={() => onColorSelect(color)}
              />
            ))}
          </View>
        </>
      )}

      {/* Rainbow Wheel */}
      {activeTab === "rainbow" && (
        <RainbowWheel
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
        />
      )}

      {/* Recent Colors */}
      {activeTab === "recent" && (
        <View style={styles.recentContainer}>
          {recentColors.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Aún no has usado ningún color. ¡Empieza a colorear!
            </Text>
          ) : (
            <View style={styles.swatchGrid}>
              {recentColors.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  isSelected={selectedColor === color}
                  onPress={() => onColorSelect(color)}
                  size={44}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Selected Color Preview */}
      <View style={[styles.selectedPreview, { borderTopColor: colors.border }]}>
        <View style={[styles.selectedSwatch, { backgroundColor: selectedColor }]} />
        <Text style={[styles.selectedHex, { color: colors.foreground }]}>
          {selectedColor.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingBottom: 16,
    maxHeight: 460,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  paletteSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 10,
  },
  palettePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  palettePillActive: {
    borderColor: "#FF3366",
    backgroundColor: "rgba(255,51,102,0.08)",
  },
  palettePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
    justifyContent: "flex-start",
  },
  swatch: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "#FF3366",
    transform: [{ scale: 1.15 }],
  },
  swatchWhite: {
    borderColor: "#CCCCCC",
  },
  wheelContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  wheel: {
    borderRadius: HALF,
    overflow: "hidden",
    position: "relative",
  },
  wheelDot: {
    position: "absolute",
    width: WHEEL_SIZE / 40 + 2,
    height: WHEEL_SIZE / 40 + 2,
  },
  cursor: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  brightnessRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  brightnessLabel: {
    fontSize: 12,
    color: "#888",
    width: 40,
  },
  brightnessTrack: {
    flex: 1,
    flexDirection: "row",
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  brightnessStep: {
    flex: 1,
    height: "100%",
  },
  brightnessStepActive: {
    borderWidth: 2,
    borderColor: "#FF3366",
  },
  recentContainer: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
    lineHeight: 22,
  },
  selectedPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
    marginTop: 8,
  },
  selectedSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  selectedHex: {
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
