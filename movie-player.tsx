import { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { useMovieTheme } from "@/lib/theme-provider";
import { safeHttpsUrl } from "@/lib/nguonc";

export function MoviePlayer({ uri, title }: { uri: string; title: string }) {
  const safeUri = safeHttpsUrl(uri);
  const { colors: C } = useMovieTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 1000 || Boolean((Platform as typeof Platform & { isTV?: boolean }).isTV);
  const styles = useMemo(() => createStyles(C, isWide), [C, isWide]);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);

  if (!safeUri) {
    return <View style={styles.frame}><Text style={styles.errorText}>Liên kết phát không hợp lệ.</Text></View>;
  }

  return (
    <View style={styles.frame}>
      {error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>Không tải được trình phát từ nguồn phim.</Text>
          <TvFocusablePressable style={styles.retry} onPress={() => { setError(false); setAttempt((value) => value + 1); }} accessibilityRole="button">
            <Text style={styles.retryText}>Thử tải lại</Text>
          </TvFocusablePressable>
        </View>
      ) : (
        <WebView
          key={`${safeUri}:${attempt}`}
          source={{ uri: safeUri }}
          style={styles.webview}
          originWhitelist={["https://*"]}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          mixedContentMode="never"
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(request) => request.url.startsWith("https://")}
          onError={() => setError(true)}
          onHttpError={(event) => { if (event.nativeEvent.statusCode >= 400) setError(true); }}
          accessible
          accessibilityLabel={`Trình phát ${title}`}
        />
      )}
    </View>
  );
}

function createStyles(C: ReturnType<typeof useMovieTheme>["colors"], isWide: boolean) {
  return StyleSheet.create({
    frame: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000000", borderRadius: isWide ? 18 : 14, overflow: "hidden", borderWidth: 1, borderColor: C.line },
    webview: { flex: 1, backgroundColor: "#000000" },
    error: { flex: 1, alignItems: "center", justifyContent: "center", padding: isWide ? 36 : 20, gap: 12, backgroundColor: "#000000" },
    errorText: { color: "#F3F2EE", fontSize: isWide ? 20 : 12, textAlign: "center" },
    retry: { minHeight: isWide ? 54 : 40, justifyContent: "center", paddingHorizontal: isWide ? 24 : 14, borderRadius: 10, backgroundColor: C.amber },
    retryText: { color: C.accentText, fontSize: isWide ? 16 : 11, fontWeight: "800" },
  });
}
