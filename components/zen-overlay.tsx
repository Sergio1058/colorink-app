import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ZenOverlayProps {
  isActive: boolean;
  onExit: () => void;
  colorCount: number;
}

const ZEN_MESSAGES = [
  "Respira. Colorea. Fluye.",
  "El arte es meditación.",
  "Cada trazo es intención.",
  "No hay errores, solo colores.",
  "Presente. Aquí. Ahora.",
  "El color es emoción.",
];

export function ZenOverlay({ isActive, onExit, colorCount }: ZenOverlayProps) {
  const [message, setMessage] = useState(ZEN_MESSAGES[0]);
  const [seconds, setSeconds] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      const msgInterval = setInterval(() => {
        setMessage(ZEN_MESSAGES[Math.floor(Math.random() * ZEN_MESSAGES.length)]);
      }, 8000);
      const secInterval = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => {
        clearInterval(msgInterval);
        clearInterval(secInterval);
      };
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      setSeconds(0);
    }
  }, [isActive]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!isActive) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="box-none">
      {/* Top zen info bar */}
      <View style={styles.topBar}>
        <View style={styles.zenBadge}>
          <Text style={styles.zenBadgeText}>🧘 MODO ZEN</Text>
        </View>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
        <Text style={styles.colorCount}>{colorCount} zonas</Text>
      </View>

      {/* Bottom message */}
      <View style={styles.bottomBar}>
        <Text style={styles.zenMessage}>{message}</Text>
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitBtnText}>Salir del Modo Zen</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    pointerEvents: "box-none",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  zenBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  zenBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timer: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  colorCount: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    gap: 12,
  },
  zenMessage: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  exitBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  exitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
