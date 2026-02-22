import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { AdBanner } from "@/components/ad-banner";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { BUILT_IN_DRAWINGS, Drawing, loadColoringProgress } from "@/lib/store";
import { DRAWING_ASSETS } from "@/lib/drawing-assets";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ─── Drawing Card ─────────────────────────────────────────────────────────────

function DrawingCard({
  drawing,
  progress,
  onPress,
}: {
  drawing: Drawing;
  progress: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const asset = DRAWING_ASSETS[drawing.imageAsset];

  const difficultyColor = {
    easy: "#22C55E",
    medium: "#F59E0B",
    hard: "#EF4444",
  }[drawing.difficulty];

  const difficultyLabel = {
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
  }[drawing.difficulty];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Drawing thumbnail */}
      <View style={styles.cardImageContainer}>
        <Image
          source={asset}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {drawing.isDaily && (
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>⭐ HOY</Text>
          </View>
        )}
      </View>

      {/* Card info */}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {drawing.title}
        </Text>
        <View style={styles.cardMeta}>
          <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
          <Text style={[styles.difficultyText, { color: colors.muted }]}>
            {difficultyLabel}
          </Text>
        </View>

        {/* Progress bar */}
        {progress > 0 && (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: "#FF3366" },
              ]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Daily Challenge Banner ───────────────────────────────────────────────────

function DailyChallengeBanner({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  const today = new Date();
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const dayName = dayNames[today.getDay()];

  return (
    <TouchableOpacity
      style={[styles.dailyBanner, { backgroundColor: "#FF3366" }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.dailyBannerContent}>
        <Text style={styles.dailyBannerLabel}>DESAFÍO DEL DÍA</Text>
        <Text style={styles.dailyBannerTitle}>¡Colorea el dibujo de {dayName}!</Text>
        <Text style={styles.dailyBannerSubtitle}>Nuevo dibujo cada día · Comparte tu obra</Text>
      </View>
      <Text style={styles.dailyBannerEmoji}>🌸</Text>
    </TouchableOpacity>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useAppContext();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [showAd, setShowAd] = useState(true);

  // Load progress for each drawing
  useEffect(() => {
    async function loadAllProgress() {
      const map: Record<string, number> = {};
      for (const drawing of BUILT_IN_DRAWINGS) {
        const progress = await loadColoringProgress(drawing.id);
        if (progress) {
          // Estimate progress as ratio of colored zones to expected zones
          const zoneCount = Object.keys(progress.colorMap).length;
          map[drawing.id] = Math.min(zoneCount / 50, 1); // 50 zones = 100%
        }
      }
      setProgressMap(map);
    }
    loadAllProgress();
  }, []);

  const handleDrawingPress = (drawing: Drawing) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/color/${drawing.id}` as any);
  };

  const coverSource = state.settings.coverImageUri
    ? { uri: state.settings.coverImageUri }
    : require("../../assets/images/cover.png");

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      <FlatList
        data={BUILT_IN_DRAWINGS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* App Header */}
            <View style={[styles.appHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.appTitle, { color: colors.foreground }]}>ColorInk</Text>
                <Text style={[styles.appSubtitle, { color: colors.muted }]}>
                  Libro de Colorear Digital
                </Text>
              </View>
              <TouchableOpacity
                style={styles.statsBtn}
                onPress={() => router.push("/gallery" as any)}
              >
                <Text style={styles.statsBtnText}>🎨</Text>
                <Text style={[styles.statsBtnLabel, { color: colors.muted }]}>
                  {state.coloredWorks.length}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cover Image */}
            <TouchableOpacity
              style={styles.coverContainer}
              onPress={() => handleDrawingPress(BUILT_IN_DRAWINGS[0])}
              activeOpacity={0.95}
            >
              <Image
                source={coverSource}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.coverOverlay}>
                <Text style={styles.coverCta}>Toca para colorear →</Text>
              </View>
            </TouchableOpacity>

            {/* Daily Challenge */}
            <DailyChallengeBanner onPress={() => handleDrawingPress(BUILT_IN_DRAWINGS[0])} />

            {/* Section title */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Todos los dibujos
            </Text>
          </>
        }
        ListFooterComponent={
          showAd ? (
            <AdBanner onClose={() => setShowAd(false)} />
          ) : null
        }
        renderItem={({ item }) => (
          <DrawingCard
            drawing={item}
            progress={progressMap[item.id] ?? 0}
            onPress={() => handleDrawingPress(item)}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  statsBtn: {
    alignItems: "center",
  },
  statsBtnText: {
    fontSize: 24,
  },
  statsBtnLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  coverContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  coverCta: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  dailyBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dailyBannerContent: {
    flex: 1,
  },
  dailyBannerLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dailyBannerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  dailyBannerSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
  },
  dailyBannerEmoji: {
    fontSize: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  row: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardImageContainer: {
    height: CARD_WIDTH * 1.2,
    backgroundColor: "#FFFFFF",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  dailyBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF3366",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dailyBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  difficultyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  difficultyText: {
    fontSize: 11,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
