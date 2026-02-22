// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for ColorInk app.
 */
const MAPPING = {
  "house.fill": "home",
  "photo.fill": "photo-library",
  "gearshape.fill": "settings",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "paintbrush.fill": "brush",
  "arrow.uturn.backward": "undo",
  "arrow.uturn.forward": "redo",
  "trash.fill": "delete",
  "square.and.arrow.up": "share",
  "xmark": "close",
  "checkmark": "check",
  "plus": "add",
  "minus": "remove",
  "magnifyingglass": "search",
  "heart.fill": "favorite",
  "star.fill": "star",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
