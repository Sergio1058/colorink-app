import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ColoringCanvas, ColoringCanvasRef } from "@/components/coloring-canvas";
import { ColorPicker } from "@/components/color-picker";
import { ZenOverlay } from "@/components/zen-overlay";
import { InterstitialAd } from "@/components/interstitial-ad";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { BUILT_IN_DRAWINGS } from "@/lib/store";
import { getDrawingAsset } from "@/lib/drawing-assets";
import {
  loadColoringProgress,
  saveColoringProgress,
  saveColoredWork,
  ColoredWork,
} from "@/lib/store";

const MAX_RECENT_COLORS = 8;
const MAX_UNDO_STEPS = 20;
const INTERSTITIAL_EVERY_N_WORKS = 3;

export default function ColorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, updateSettings, addColoredWork } = useAppContext();
  const canvasRef = useRef<ColoringCanvasRef>(null);

  useKeepAwake();

  const drawing = BUILT_IN_DRAWINGS.find((d) => d.id === id);
  const asset = id ? getDrawingAsset(id) : null;

  // ─── State ───────────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState("#FF3366");
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<Record<string, string>[]>([]);
  const [redoStack, setRedoStack] = useState<Record<string, string>[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);

  // ─── Load Progress ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    loadColoringProgress(id).then((progress) => {
      if (progress) {
        setColorMap(progress.colorMap);
        setRecentColors(progress.recentColors);
      }
    });
  }, [id]);

  // ─── Auto-save ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || Object.keys(colorMap).length === 0) return;
    const timer = setTimeout(() => {
      saveColoringProgress({
        drawingId: id,
        colorMap,
        recentColors,
        lastModified: new Date().toISOString(),
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [colorMap, recentColors, id]);

  // ─── Color Zone Handler ───────────────────────────────────────────────────────
  const handleColorZone = useCallback(
    (x: number, y: number) => {
      const key = `${Math.round(x / 8) * 8},${Math.round(y / 8) * 8}`;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setUndoStack((prev) => {
        const newStack = [...prev, colorMap];
        return newStack.slice(-MAX_UNDO_STEPS);
      });
      setRedoStack([]);
      setColorMap((prev) => ({ ...prev, [key]: selectedColor }));
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c !== selectedColor);
        return [selectedColor, ...filtered].slice(0, MAX_RECENT_COLORS);
      });
    },
    [selectedColor, colorMap]
  );

  // ─── Undo / Redo ─────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [colorMap, ...r].slice(0, MAX_UNDO_STEPS));
    setUndoStack((u) => u.slice(0, -1));
    setColorMap(prev);
  }, [undoStack, colorMap]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const next = redoStack[0];
    setUndoStack((u) => [...u, colorMap].slice(-MAX_UNDO_STEPS));
    setRedoStack((r) => r.slice(1));
    setColorMap(next);
  }, [redoStack, colorMap]);

  // ─── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    Alert.alert(
      "Borrar coloreado",
      "¿Seguro que quieres empezar de cero? Se perderán todos los colores.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: () => {
            setUndoStack((prev) => [...prev, colorMap].slice(-MAX_UNDO_STEPS));
            setRedoStack([]);
            setColorMap({});
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          },
        },
      ]
    );
  }, [colorMap]);

  // ─── Complete Drawing ─────────────────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    if (!id || !drawing) return;

    const work: ColoredWork = {
      id: `${id}_${Date.now()}`,
      drawingId: id,
      drawingTitle: drawing.title,
      colorData: JSON.stringify(colorMap),
      completedAt: new Date().toISOString(),
    };

    await saveColoredWork(work);
    addColoredWork(work);

    // Clear progress for this drawing (reusable drawing concept)
    await saveColoringProgress({
      drawingId: id,
      colorMap: {},
      recentColors: [],
      lastModified: new Date().toISOString(),
    });

    const newCount = state.settings.worksCompleted + 1;
    await updateSettings({ worksCompleted: newCount });

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Show interstitial every N works
    if (newCount % INTERSTITIAL_EVERY_N_WORKS === 0) {
      setShowInterstitial(true);
    } else {
      Alert.alert(
        "¡Obra guardada! 🎉",
        "Tu obra ha sido guardada en la galería. El dibujo se ha reiniciado para que puedas colorear de nuevo.",
        [{ text: "Ver galería", onPress: () => router.push("/gallery" as any) }, { text: "Seguir coloreando" }]
      );
    }
  }, [id, drawing, colorMap, state.settings.worksCompleted, addColoredWork, updateSettings, router]);

  // ─── Unlock Palette ───────────────────────────────────────────────────────────
  const handleUnlockPalette = useCallback(
    (paletteId: string) => {
      Alert.alert(
        "Desbloquear Paleta",
        "Ver un breve anuncio para desbloquear esta paleta de colores de forma permanente.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Ver anuncio",
            onPress: () => {
              setTimeout(() => {
                const newPalettes = [...state.settings.unlockedPalettes, paletteId];
                updateSettings({ unlockedPalettes: newPalettes });
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                Alert.alert("¡Paleta desbloqueada!", "Ya puedes usar esta paleta de colores.");
              }, 500);
            },
          },
        ]
      );
    },
    [state.settings.unlockedPalettes, updateSettings]
  );

  if (!drawing || !asset) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>
          Dibujo no encontrado
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#FF3366", marginTop: 12 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const colorCount = Object.keys(colorMap).length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {/* Header */}
        {!isZenMode && (
          <View
            style={[
              styles.header,
              { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
            ]}
          >
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
              <Text style={styles.headerBtnText}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
                {drawing.title}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                {colorCount} zonas coloreadas
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerBtn, undoStack.length === 0 && styles.headerBtnDisabled]}
                onPress={handleUndo}
                disabled={undoStack.length === 0}
              >
                <Text style={[styles.headerBtnText, undoStack.length === 0 && { opacity: 0.3 }]}>↩</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerBtn, redoStack.length === 0 && styles.headerBtnDisabled]}
                onPress={handleRedo}
                disabled={redoStack.length === 0}
              >
                <Text style={[styles.headerBtnText, redoStack.length === 0 && { opacity: 0.3 }]}>↪</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={handleReset}>
                <Text style={styles.headerBtnText}>🗑</Text>
              </TouchableOpacity>
              {colorCount > 0 && (
                <TouchableOpacity
                  style={[styles.headerBtn, styles.completeBtn]}
                  onPress={handleComplete}
                >
                  <Text style={styles.completeBtnText}>✓</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvasArea}>
          <ColoringCanvas
            ref={canvasRef}
            imageSource={asset}
            colorMap={colorMap}
            onColorZone={handleColorZone}
            activeColor={selectedColor}
            isZenMode={isZenMode}
          />

          {/* Zen Overlay */}
          <ZenOverlay
            isActive={isZenMode}
            onExit={() => setIsZenMode(false)}
            colorCount={colorCount}
          />
        </View>

        {/* Toolbar */}
        {!isZenMode && (
          <View style={[styles.toolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            {/* Active color indicator */}
            <TouchableOpacity
              style={[styles.activeColorBtn, { backgroundColor: selectedColor }]}
              onPress={() => setShowColorPicker((v) => !v)}
            />

            {/* Quick palette (last 6 recent colors) */}
            <View style={styles.quickPalette}>
              {recentColors.slice(0, 6).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.quickColor,
                    { backgroundColor: c },
                    c === selectedColor && styles.quickColorSelected,
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>

            {/* Zen mode toggle */}
            <TouchableOpacity
              style={[styles.zenBtn, { borderColor: colors.border }]}
              onPress={() => setIsZenMode(true)}
            >
              <Text style={styles.zenBtnText}>🧘</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Color Picker Panel */}
        {showColorPicker && !isZenMode && (
          <ColorPicker
            selectedColor={selectedColor}
            recentColors={recentColors}
            unlockedPalettes={state.settings.unlockedPalettes}
            onColorSelect={(color) => setSelectedColor(color)}
            onUnlockPalette={handleUnlockPalette}
          />
        )}

        {/* Interstitial Ad */}
        <InterstitialAd
          visible={showInterstitial}
          onClose={() => {
            setShowInterstitial(false);
            router.push("/gallery" as any);
          }}
          onWatchRewarded={() => {
            setShowInterstitial(false);
            // Simulate rewarded ad - unlock a random palette
            const locked = ["neon", "pastel", "japanese"].filter(
              (p) => !state.settings.unlockedPalettes.includes(p)
            );
            if (locked.length > 0) {
              const toUnlock = locked[0];
              updateSettings({
                unlockedPalettes: [...state.settings.unlockedPalettes, toUnlock],
              });
              Alert.alert("¡Paleta desbloqueada!", `Has desbloqueado la paleta "${toUnlock}".`);
            }
            router.push("/gallery" as any);
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnDisabled: {
    opacity: 0.4,
  },
  headerBtnText: {
    fontSize: 18,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  completeBtn: {
    backgroundColor: "#FF3366",
    borderRadius: 18,
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  canvasArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  activeColorBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#FF3366",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickPalette: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  quickColor: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  quickColorSelected: {
    borderWidth: 2.5,
    borderColor: "#FF3366",
    transform: [{ scale: 1.15 }],
  },
  zenBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  zenBtnText: {
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
