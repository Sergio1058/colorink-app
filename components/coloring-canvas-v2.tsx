import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  onColorZone: (x: number, y: number, color: string) => void;
  activeColor: string;
  isZenMode?: boolean;
}

/**
 * Simplified coloring canvas that stores color zones as coordinates.
 * Each tap records a zone with its color, rendered as colored circles under the image.
 */
export const ColoringCanvasV2 = forwardRef<ColoringCanvasRef, Props>(
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

    // Pan gesture (2 fingers)
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
        runOnJS(onColorZone)(imgX, imgY, activeColor);
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
      <GestureDetector gesture={composedGesture}>
        <View style={styles.container}>
          <Animated.View style={[styles.canvasWrapper, animatedStyle]}>
            {/* Color zones layer - colored circles under the drawing */}
            <View style={[styles.image, { width: imageSize.width, height: imageSize.height }]}>
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
              onLoad={() => {
                // Use Image.getSize to get actual dimensions
                if (typeof imageSource === "number") {
                  // For require() images, use a default aspect ratio
                  setImageSize({ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2 });
                } else if (imageSource.uri) {
                  Image.getSize(
                    imageSource.uri,
                    (width, height) => {
                      const ratio = height / width;
                      setImageSize({ width: SCREEN_WIDTH, height: SCREEN_WIDTH * ratio });
                    },
                    () => {
                      // Fallback on error
                      setImageSize({ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2 });
                    }
                  );
                }
                setIsLoading(false);
              }}
            />

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FF3366" />
              </View>
            )}
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }
);

ColoringCanvasV2.displayName = "ColoringCanvasV2";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  canvasWrapper: {
    flex: 1,
  },
  image: {
    position: "absolute",
  },
  colorDot: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.7,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
