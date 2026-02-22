import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ALL_PALETTES, ColorPalette } from "@/lib/colors";
import { useColors } from "@/hooks/use-colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

// ─── Gradient Spectrum ────────────────────────────────────────────────────────

function GradientSpectrum({ onColorSelect }: { onColorSelect: (color: string) => void }) {
  const colors = useColors();
  const spectrumColors = [
    "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3",
  ] as const;

  return (
    <View style={styles.gradientContainer}>
      <LinearGradient
        colors={spectrumColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />
      <View style={styles.gradientSwatches}>
        {spectrumColors.map((color: string) => (
            <TouchableOpacity
              key={color}
              style={[styles.gradientSwatch, { backgroundColor: color as any }]}
              onPress={() => onColorSelect(color)}
            />
        ))}
      </View>
    </View>
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

type Tab = "palette" | "spectrum" | "recent";

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
        {(["palette", "spectrum", "recent"] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: "#FF3366", borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? "#FF3366" : colors.muted }]}>
              {tab === "palette" ? "Paleta" : tab === "spectrum" ? "Espectro" : "Recientes"}
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

      {/* Gradient Spectrum */}
      {activeTab === "spectrum" && (
        <GradientSpectrum onColorSelect={onColorSelect} />
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
    maxHeight: 380,
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
    marginBottom: 12,
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
  gradientContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  gradientBar: {
    height: 40,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gradientSwatches: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 4,
  },
  gradientSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.15)",
  },
  recentContainer: {
    padding: 12,
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
