import { useState } from "react";
import { Pressable, StyleSheet, type PressableProps, type PressableStateCallbackType } from "react-native";
import { useMovieTheme } from "@/lib/theme-provider";

type TvFocusablePressableProps = PressableProps & {
  focusScale?: number;
};

export function TvFocusablePressable({
  children,
  focusScale = 1.035,
  onBlur,
  onFocus,
  style,
  ...props
}: TvFocusablePressableProps) {
  const { colors } = useMovieTheme();
  const [focused, setFocused] = useState(false);
  const resolveStyle = (state: PressableStateCallbackType) => {
    const baseStyle = typeof style === "function" ? style(state) : style;
    return [
      baseStyle,
      focused && {
        borderColor: colors.amber,
        borderWidth: 2,
        shadowColor: colors.amber,
        shadowOpacity: 0.42,
        shadowRadius: 9,
        elevation: 8,
        transform: [{ scale: focusScale }],
        zIndex: 2,
      },
    ];
  };

  return (
    <Pressable
      {...props}
      focusable
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={resolveStyle}
    >
      {children}
    </Pressable>
  );
}

export const tvFocusStyles = StyleSheet.create({
  focusable: { minHeight: 44 },
});
