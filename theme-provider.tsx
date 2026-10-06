import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import { MoviePalettes, type MoviePalette } from "@/constants/movie-theme";

const THEME_STORAGE_KEY = "phimviet.theme.v1";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  colors: MoviePalette;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() === "dark" ? "dark" : "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("dark");
  const userChangedTheme = useRef(false);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (!active || userChangedTheme.current) return;
        setColorSchemeState(saved === "light" || saved === "dark" ? saved : systemScheme);
      })
      .catch(() => {
        if (active && !userChangedTheme.current) setColorSchemeState(systemScheme);
      });
    return () => {
      active = false;
    };
  }, [systemScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    userChangedTheme.current = true;
    setColorSchemeState(scheme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, scheme).catch(() => undefined);
  }, []);

  useEffect(() => {
    applyScheme(colorScheme);
  }, [applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({ colorScheme, setColorScheme, colors: MoviePalettes[colorScheme] as MoviePalette }),
    [colorScheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1, backgroundColor: MoviePalettes[colorScheme].background }, themeVariables]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}

export function useMovieTheme(): ThemeContextValue {
  return useThemeContext();
}
