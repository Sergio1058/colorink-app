import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface AdBannerProps {
  onClose?: () => void;
}

const AD_MESSAGES = [
  { title: "ColorInk Pro", subtitle: "Sin anuncios · Todas las paletas · Soporte al artista" },
  { title: "¿Te gusta colorear?", subtitle: "Comparte tus obras en Instagram #ColorInkApp" },
  { title: "Libro Físico", subtitle: "Pronto disponible: el primer libro de ColorInk para adultos" },
];

export function AdBanner({ onClose }: AdBannerProps) {
  const colors = useColors();
  const [adIndex] = useState(() => Math.floor(Math.random() * AD_MESSAGES.length));
  const ad = AD_MESSAGES[adIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>PUBLICIDAD</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.adIcon}>
          <Text style={styles.adIconText}>🎨</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {ad.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
            {ad.subtitle}
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeBtnText, { color: colors.muted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  adLabel: {
    position: "absolute",
    top: 4,
    right: 12,
  },
  adLabelText: {
    fontSize: 9,
    color: "#AAAAAA",
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,51,102,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  adIconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 14,
  },
});
