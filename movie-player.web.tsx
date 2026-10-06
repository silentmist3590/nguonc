import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { useMovieTheme } from "@/lib/theme-provider";
import { safeHttpsUrl } from "@/lib/nguonc";

const IFrame = "iframe" as unknown as React.ElementType;

export function MoviePlayer({ uri, title }: { uri: string; title: string }) {
  const safeUri = safeHttpsUrl(uri);
  const { colors: C } = useMovieTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;
  const styles = useMemo(() => createStyles(C, isWide), [C, isWide]);
  const [attempt, setAttempt] = useState(0);

  if (!safeUri) {
    return <View style={styles.frame}><Text style={styles.fallback}>Liên kết phát không hợp lệ.</Text></View>;
  }

  return (
    <View>
      <View style={styles.frame}>
        {React.createElement(IFrame, {
          key: `${safeUri}:${attempt}`,
          src: safeUri,
          title: `Trình phát ${title}`,
          allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
          allowFullScreen: true,
          referrerPolicy: "strict-origin-when-cross-origin",
          sandbox: "allow-scripts allow-same-origin allow-presentation",
          style: { width: "100%", height: "100%", border: 0, backgroundColor: "#000000" },
        })}
      </View>
      <TvFocusablePressable style={styles.retry} onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button">
        <Text style={styles.retryText}>Không tải được? Thử tải lại player</Text>
      </TvFocusablePressable>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useMovieTheme>["colors"], isWide: boolean) {
  return StyleSheet.create({
    frame: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000000", borderRadius: isWide ? 18 : 14, overflow: "hidden", borderWidth: 1, borderColor: C.line },
    fallback: { color: C.text, padding: 18, fontSize: isWide ? 18 : 12 },
    retry: { alignSelf: "flex-start", minHeight: isWide ? 50 : 36, justifyContent: "center", marginTop: 9, paddingHorizontal: isWide ? 17 : 11, paddingVertical: 7, borderRadius: 9, backgroundColor: C.surfaceRaised },
    retryText: { color: C.amber, fontSize: isWide ? 14 : 10, fontWeight: "800" },
  });
}
