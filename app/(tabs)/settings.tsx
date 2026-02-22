import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  isDestructive,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: isDestructive ? "rgba(239,68,68,0.1)" : "rgba(255,51,102,0.1)" }]}>
        <Text style={styles.rowIconText}>{icon}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: isDestructive ? "#EF4444" : colors.foreground }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement ?? (onPress && <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>)}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.muted }]}>{title.toUpperCase()}</Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { state, updateSettings } = useAppContext();
  const [isPickingImage, setIsPickingImage] = useState(false);

  const coverSource = state.settings.coverImageUri
    ? { uri: state.settings.coverImageUri }
    : require("../../assets/images/cover.png");

  const handleChangeCover = async () => {
    if (isPickingImage) return;
    setIsPickingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu galería para cambiar la imagen de portada."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateSettings({ coverImageUri: result.assets[0].uri });
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert("¡Portada actualizada!", "La nueva imagen de portada ya está activa.");
      }
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleResetCover = () => {
    Alert.alert(
      "Restablecer portada",
      "¿Quieres volver a la imagen de portada original?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restablecer",
          onPress: () => updateSettings({ coverImageUri: null }),
        },
      ]
    );
  };

  const handleToggleSound = (value: boolean) => {
    updateSettings({ soundEnabled: value });
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Borrar todo el progreso",
      "Se eliminarán todos los coloreados guardados. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: async () => {
            await updateSettings({ worksCompleted: 0, totalColoringMinutes: 0 });
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ajustes</Text>
        </View>

        {/* Cover Preview */}
        <View style={[styles.coverSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image source={coverSource} style={styles.coverPreview} resizeMode="cover" />
          <View style={styles.coverActions}>
            <TouchableOpacity
              style={[styles.coverBtn, { backgroundColor: "#FF3366" }]}
              onPress={handleChangeCover}
              disabled={isPickingImage}
            >
              <Text style={styles.coverBtnText}>
                {isPickingImage ? "Cargando..." : "📷 Cambiar portada"}
              </Text>
            </TouchableOpacity>
            {state.settings.coverImageUri && (
              <TouchableOpacity
                style={[styles.coverBtn, { backgroundColor: colors.border }]}
                onPress={handleResetCover}
              >
                <Text style={[styles.coverBtnText, { color: colors.foreground }]}>
                  Restablecer
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.coverHint, { color: colors.muted }]}>
            Toca "Cambiar portada" para usar una de tus ilustraciones como imagen principal de la app.
          </Text>
        </View>

        {/* Estadísticas */}
        <SectionHeader title="Mis estadísticas" />
        <View style={[styles.statsGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#FF3366" }]}>
              {state.settings.worksCompleted}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Obras completadas</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#FF3366" }]}>
              {state.settings.totalColoringMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Minutos coloreando</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#FF3366" }]}>
              {state.settings.unlockedPalettes.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Paletas desbloqueadas</Text>
          </View>
        </View>

        {/* Preferencias */}
        <SectionHeader title="Preferencias" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            icon="🔊"
            title="Sonidos"
            subtitle="Efectos de sonido al colorear"
            rightElement={
              <Switch
                value={state.settings.soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: colors.border, true: "#FF3366" }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Paletas */}
        <SectionHeader title="Paletas de color" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {["classic", "murakami", "neon", "pastel", "japanese"].map((id) => {
            const names: Record<string, string> = {
              classic: "Clásica",
              murakami: "Murakami Pop",
              neon: "Neon Tokyo",
              pastel: "Pastel Dreams",
              japanese: "Japonés Tradicional",
            };
            const unlocked = state.settings.unlockedPalettes.includes(id);
            return (
              <SettingsRow
                key={id}
                icon={unlocked ? "🎨" : "🔒"}
                title={names[id]}
                subtitle={unlocked ? "Desbloqueada" : "Ver anuncio para desbloquear"}
              />
            );
          })}
        </View>

        {/* Acerca de */}
        <SectionHeader title="Acerca de" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            icon="📖"
            title="Libro físico"
            subtitle="Próximamente: el primer libro de ColorInk para adultos"
          />
          <SettingsRow
            icon="📸"
            title="Instagram"
            subtitle="Comparte tus obras con #ColorInkApp"
          />
          <SettingsRow
            icon="⭐"
            title="Valorar la app"
            subtitle="¿Te gusta ColorInk? ¡Déjanos una reseña!"
          />
          <SettingsRow
            icon="ℹ️"
            title="Versión"
            subtitle="ColorInk 1.0.0 · Hecho con ❤️ y arte"
          />
        </View>

        {/* Zona peligrosa */}
        <SectionHeader title="Zona de peligro" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsRow
            icon="🗑"
            title="Borrar todo el progreso"
            subtitle="Elimina todos los coloreados guardados"
            onPress={handleResetProgress}
            isDestructive
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            ColorInk — Libro de Colorear Digital{"\n"}
            Inspirado en el arte de Takashi Murakami
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  coverSection: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  coverPreview: {
    width: "100%",
    height: 160,
  },
  coverActions: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  coverBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  coverBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  coverHint: {
    fontSize: 11,
    paddingHorizontal: 12,
    paddingBottom: 12,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  statsGrid: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconText: {
    fontSize: 18,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    fontWeight: "300",
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
