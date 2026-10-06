import { useEffect, useState } from "react";
import { Pressable, StyleSheet, type PressableProps, type PressableStateCallbackType } from "react-native";
import { useMovieTheme } from "@/lib/theme-provider";

type TvFocusablePressableProps = PressableProps & {
  focusScale?: number;
};

let remoteNavigationUsers = 0;

function moveFocusByDirection(event: KeyboardEvent) {
  if (window.innerWidth < 1000 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;

  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || active === document.body) {
    const first = document.querySelector<HTMLElement>('[tabindex="0"]');
    if (first) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (active instanceof HTMLIFrameElement || active.matches("input, textarea, select, [contenteditable='true']")) return;

  const current = active.getBoundingClientRect();
  const centerX = current.left + current.width / 2;
  const centerY = current.top + current.height / 2;
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(
    'button, a[href], input:not([disabled]), [role="button"], [tabindex="0"]',
  )).filter((element) => {
    if (element === active || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;
  });

  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const rect = candidate.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const primary = event.key === "ArrowRight" ? x - centerX
      : event.key === "ArrowLeft" ? centerX - x
      : event.key === "ArrowDown" ? y - centerY
      : centerY - y;
    if (primary <= 1) continue;
    const secondary = event.key === "ArrowRight" || event.key === "ArrowLeft"
      ? Math.abs(y - centerY)
      : Math.abs(x - centerX);
    const score = primary + secondary * 1.4;
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  if (!best) return;
  event.preventDefault();
  best.focus({ preventScroll: false });
}

function subscribeToRemoteNavigation() {
  if (typeof window === "undefined") return () => {};
  remoteNavigationUsers += 1;
  if (remoteNavigationUsers === 1) window.addEventListener("keydown", moveFocusByDirection, true);
  return () => {
    remoteNavigationUsers = Math.max(0, remoteNavigationUsers - 1);
    if (remoteNavigationUsers === 0) window.removeEventListener("keydown", moveFocusByDirection, true);
  };
}

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
  useEffect(() => subscribeToRemoteNavigation(), []);

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
