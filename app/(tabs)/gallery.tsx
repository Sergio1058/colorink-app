import React, { useState, useCallback } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { deleteColoredWork } from "@/lib/store";
import { DRAWING_ASSETS } from "@/lib/drawing-assets"

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_SIZE = (SCREEN_WIDTH - 48) / 2;

export default function GalleryScreen() {
  const colors = useColors();
  const { state, removeColoredWork } = useAppContext();

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Eliminar obra",
      `¿Quieres eliminar "${title}" de tu galería?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteColoredWork(id);
            removeColoredWork(id);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          },
        },
      ]
    );
  };

  if (state.coloredWorks.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center p-8">
        <Text style={{ fontSize: 64 }}>🎨</Text>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Tu galería está vacía
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          Completa un dibujo y aparecerá aquí. ¡Tus obras te esperan!
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Mi Galería</Text>
        <Text style={[styles.headerCount, { color: colors.muted }]}>
          {state.coloredWorks.length} obra{state.coloredWorks.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={state.coloredWorks}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const asset = DRAWING_ASSETS[item.drawingId];
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.cardImageContainer}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: Navigate to view completed work
                }}
              >
                <View style={styles.cardImage}>
                  {asset ? (
                    <Image source={asset} style={styles.image} resizeMode="cover" />
                  ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                      <Text style={{ fontSize: 32 }}>🖼</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {item.drawingTitle}
                    </Text>
                    <Text style={[styles.cardDate, { color: colors.muted }]}>
                      {new Date(item.completedAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.drawingTitle)}
                    style={[styles.deleteButton, { backgroundColor: colors.error }]}
                  >
                    <Text style={{ fontSize: 16 }}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  headerCount: {
    fontSize: 14,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  row: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  card: {
    width: CARD_SIZE,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardImageContainer: {
    width: "100%",
  },
  cardImage: {
    height: CARD_SIZE,
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    padding: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
