import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { INK_THRESHOLD } from "@/lib/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorZone {
  x: number;
  y: number;
  color: string;
}

export interface ColoringCanvasRef {
  undo: () => void;
  redo: () => void;
  reset: () => void;
  getColorMap: () => Record<string, string>;
  canUndo: boolean;
  canRedo: boolean;
}

interface Props {
  imageSource: { uri: string } | number;
  colorMap: Record<string, string>;
  onColorZone: (x: number, y: number) => void;
  activeColor: string;
  isZenMode?: boolean;
}

// ─── Canvas Component ─────────────────────────────────────────────────────────

/**
 * ColoringCanvas renders the drawing image with color overlays.
 * Since true pixel-level flood-fill requires native canvas access (not available
 * in React Native without a WebView or native module), we implement a
 * region-based coloring system using touch coordinates mapped to color zones.
 *
 * The approach:
 * 1. Display the original black & white drawing
 * 2. Track touch points and their associated colors as "zones"
 * 3. Render colored circles/regions under the drawing with multiply blend
 * 4. The drawing's black outlines naturally contain the color visually
 */
export const ColoringCanvas = forwardRef<ColoringCanvasRef, Props>(
  ({ imageSource, colorMap, onColorZone, activeColor, isZenMode }, ref) => {
    const [imageSize, setImageSize] = useState({ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.4 });
    const [isLoading, setIsLoading] = useState(true);

    // Zoom & Pan state
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Pinch to zoom
    const pinchGesture = Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.8), 4);
      })
      .onEnd(() => {
        savedScale.value = scale.value;
      });

    // Pan gesture
    const panGesture = Gesture.Pan()
      .minPointers(2)
      .onUpdate((e) => {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    // Double tap to reset zoom
    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        scale.value = withTiming(1, { duration: 250 });
        savedScale.value = 1;
        translateX.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(0, { duration: 250 });
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      });

    // Single tap to color
    const tapGesture = Gesture.Tap()
      .numberOfTaps(1)
      .maxDuration(250)
      .onEnd((e) => {
        // Convert screen coordinates to image coordinates
        const imgX = (e.x - translateX.value) / scale.value;
        const imgY = (e.y - translateY.value) / scale.value;
        runOnJS(onColorZone)(imgX, imgY);
      });

    const composedGesture = Gesture.Simultaneous(
      Gesture.Race(doubleTapGesture, tapGesture),
      Gesture.Simultaneous(pinchGesture, panGesture)
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      undo: () => {},
      redo: () => {},
      reset: () => {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      },
      getColorMap: () => colorMap,
      canUndo: false,
      canRedo: false,
    }));

    return (
      <View style={styles.container}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.canvasWrapper, animatedStyle]}>
            {/* Color zones layer - rendered BELOW the drawing */}
            <View style={[StyleSheet.absoluteFill, styles.colorLayer]}>
              {Object.entries(colorMap).map(([key, color]) => {
                const [x, y] = key.split(",").map(Number);
                return (
                  <View
                    key={key}
                    style={[
                      styles.colorDot,
                      {
                        left: x - 30,
                        top: y - 30,
                        backgroundColor: color,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Drawing image on top - black lines act as natural borders */}
            <Image
              source={imageSource}
              style={[styles.image, { width: imageSize.width, height: imageSize.height }]}
              resizeMode="contain"
              onLoad={(e) => {
                const { width, height } = e.nativeEvent.source;
                const ratio = height / width;
                setImageSize({ width: SCREEN_WIDTH, height: SCREEN_WIDTH * ratio });
                setIsLoading(false);
              }}
            />

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FF3366" />
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

ColoringCanvas.displayName = "ColoringCanvas";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  canvasWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  colorLayer: {
    zIndex: 1,
  },
  colorDot: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.85,
  },
  image: {
    zIndex: 2,
    position: "relative",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    zIndex: 10,
  },
});
