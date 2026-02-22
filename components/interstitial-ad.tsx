import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface InterstitialAdProps {
  visible: boolean;
  onClose: () => void;
  onWatchRewarded?: () => void;
}

export function InterstitialAd({ visible, onClose, onWatchRewarded }: InterstitialAdProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15 }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          {/* Ad content */}
          <View style={styles.adHeader}>
            <Text style={styles.adLabel}>PUBLICIDAD</Text>
          </View>

          <View style={styles.adBody}>
            <Text style={styles.adEmoji}>🎨</Text>
            <Text style={styles.adTitle}>¡Obra completada!</Text>
            <Text style={styles.adSubtitle}>
              Apoya a ColorInk viendo este breve anuncio. Así podemos seguir creando arte para ti.
            </Text>

            <View style={styles.adPlaceholder}>
              <Text style={styles.adPlaceholderText}>
                [Espacio para anuncio AdMob]{"\n"}
                Aquí aparecerá un anuncio real cuando la app esté publicada
              </Text>
            </View>
          </View>

          <View style={styles.adActions}>
            {onWatchRewarded && (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={onWatchRewarded}
              >
                <Text style={styles.btnPrimaryText}>🎁 Ver anuncio y ganar paleta</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Continuar sin ver →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
    maxWidth: 360,
  },
  adHeader: {
    backgroundColor: "#FF3366",
    paddingVertical: 8,
    alignItems: "center",
  },
  adLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  adBody: {
    padding: 24,
    alignItems: "center",
  },
  adEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  adTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A18",
    marginBottom: 8,
    textAlign: "center",
  },
  adSubtitle: {
    fontSize: 14,
    color: "#8A8A80",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  adPlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E8E8E0",
    borderStyle: "dashed",
  },
  adPlaceholderText: {
    fontSize: 11,
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: 18,
  },
  adActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#FF3366",
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: "transparent",
  },
  btnSecondaryText: {
    color: "#8A8A80",
    fontSize: 14,
  },
});
