import { useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { useMovieTheme } from "@/lib/theme-provider";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { removeWatchProgress, type WatchProgress } from "@/lib/watch-progress";
import { trpc } from "@/lib/trpc";

export default function ContinueScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors: C } = useMovieTheme();
  const isWide = width >= 920 || Boolean((Platform as typeof Platform & { isTV?: boolean }).isTV);
  const styles = useMemo(() => createStyles(C, isWide), [C, isWide]);
  const { user, scope, items, history, refreshLocal } = useWatchHistory();
  const utils = trpc.useUtils();
  const removeMutation = trpc.history.remove.useMutation();
  const [actionError, setActionError] = useState("");

  const openItem = (item: WatchProgress) => router.push({
    pathname: "/watch/[slug]",
    params: {
      slug: item.movieSlug,
      movieName: item.movieName,
      posterUrl: item.posterUrl,
      episodeSlug: item.episodeSlug,
      episodeName: item.episodeName,
      serverName: item.serverName,
    },
  });

  const removeItem = async (item: WatchProgress) => {
    setActionError("");
    try {
      if (user?.openId) {
        await removeMutation.mutateAsync({ movieSlug: item.movieSlug, episodeSlug: item.episodeSlug, serverName: item.serverName });
        await utils.history.list.invalidate();
      }
      await removeWatchProgress(item.movieSlug, item.episodeSlug, item.serverName, scope);
      await refreshLocal();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không xóa được mục lịch sử.");
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.page}>
        <Text style={styles.kicker}>QUAY LẠI RẠP</Text>
        <Text style={styles.title}>Đang xem dở</Text>
        <Text style={styles.subtitle}>{user ? "Lịch sử riêng của tài khoản, kết hợp với dữ liệu cục bộ trên thiết bị." : "Mở lại phim và tập bạn vừa xem trên thiết bị này."}</Text>
        {user && history.isLoading ? <View style={styles.syncLine}><ActivityIndicator color={C.amber} /><Text style={styles.syncText}>Đang tải lịch sử tài khoản…</Text></View> : null}
        {user && history.isError ? <View style={styles.warning}><MaterialCommunityIcons name="cloud-alert-outline" size={17} color={C.wine} /><Text style={styles.warningText}>Không tải được lịch sử trên tài khoản. Các mục cục bộ vẫn được giữ.</Text></View> : null}
        {!!actionError && <View style={styles.warning}><MaterialCommunityIcons name="alert-circle-outline" size={17} color={C.wine} /><Text style={styles.warningText}>{actionError}</Text></View>}
        {items.length ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {items.map((item) => (
              <View key={`${item.movieSlug}:${item.episodeSlug}:${item.serverName}`} style={styles.card}>
                <TvFocusablePressable style={styles.mainCard} onPress={() => openItem(item)} accessibilityRole="button" accessibilityLabel={`Mở lại ${item.movieName}, ${item.episodeName}`}>
                  <View style={styles.poster}>
                    {item.posterUrl ? <Image source={{ uri: item.posterUrl }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <MaterialCommunityIcons name="movie-open-outline" size={isWide ? 36 : 28} color={C.amber} />}
                    <View style={styles.play}><MaterialCommunityIcons name="play" size={isWide ? 22 : 18} color={C.accentText} /></View>
                  </View>
                  <View style={styles.copy}>
                    <Text numberOfLines={2} style={styles.movie}>{item.movieName}</Text>
                    <Text style={styles.episode}>{item.episodeName}</Text>
                    <Text style={styles.server}>{item.serverName}</Text>
                    <Text style={styles.lastOpened}>Mở gần đây · {new Date(item.updatedAt).toLocaleDateString("vi-VN")}</Text>
                    <View style={styles.continueButton}><Text style={styles.continueText}>MỞ LẠI TẬP NÀY</Text><MaterialCommunityIcons name="arrow-right" size={15} color={C.accentText} /></View>
                  </View>
                </TvFocusablePressable>
                <TvFocusablePressable style={styles.remove} onPress={() => { void removeItem(item); }} disabled={removeMutation.isPending} accessibilityRole="button" accessibilityLabel={`Xóa ${item.movieName} khỏi danh sách Đang xem`}>
                  <MaterialCommunityIcons name="close" size={isWide ? 23 : 17} color={C.muted} />
                </TvFocusablePressable>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><MaterialCommunityIcons name="movie-open-outline" size={isWide ? 38 : 30} color={C.amber} /></View>
            <Text style={styles.emptyTitle}>Rạp đang chờ bạn</Text>
            <Text style={styles.emptyBody}>Khi mở một tập phim, phim đó sẽ xuất hiện ở đây để bạn quay lại sau.</Text>
            <TvFocusablePressable style={styles.browseButton} onPress={() => router.push("/")} accessibilityRole="button"><Text style={styles.browseText}>Khám phá phim</Text></TvFocusablePressable>
          </View>
        )}
        <Text style={styles.note}>Nguồn C chỉ cung cấp liên kết player nhúng; ứng dụng lưu phim và tập vừa mở, không lưu vị trí phát.</Text>
      </View>
    </ScreenContainer>
  );
}

function createStyles(C: ReturnType<typeof import("@/lib/theme-provider").useMovieTheme>["colors"], isWide: boolean) {
  return StyleSheet.create({
    page: { flex: 1, width: "100%", maxWidth: isWide ? 1180 : undefined, alignSelf: "center", paddingHorizontal: isWide ? 42 : 20, paddingTop: isWide ? 26 : 18 },
    kicker: { color: C.amber, fontSize: isWide ? 12 : 9, fontWeight: "800", letterSpacing: 1.8 },
    title: { color: C.text, fontSize: isWide ? 38 : 26, fontWeight: "900", marginTop: 4 },
    subtitle: { color: C.muted, fontSize: isWide ? 16 : 11, lineHeight: isWide ? 23 : 17, marginTop: 5, marginBottom: 17 },
    syncLine: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    syncText: { color: C.muted, fontSize: isWide ? 14 : 10 },
    warning: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 11, marginBottom: 12, borderRadius: 10, backgroundColor: C.surfaceRaised },
    warningText: { flex: 1, color: C.muted, fontSize: isWide ? 14 : 10, lineHeight: isWide ? 20 : 15 },
    list: { width: "100%", paddingBottom: 16 },
    card: { flexDirection: "row", alignItems: "flex-start", borderRadius: 17, padding: isWide ? 17 : 11, marginBottom: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
    mainCard: { flex: 1, flexDirection: "row", gap: isWide ? 18 : 12, padding: 3, borderRadius: 12 },
    poster: { width: isWide ? 128 : 88, height: isWide ? 186 : 126, borderRadius: 11, overflow: "hidden", backgroundColor: C.surfaceRaised, alignItems: "center", justifyContent: "center" },
    play: { position: "absolute", right: 8, bottom: 8, width: isWide ? 40 : 29, height: isWide ? 40 : 29, borderRadius: 22, backgroundColor: C.amber, alignItems: "center", justifyContent: "center" },
    copy: { flex: 1, justifyContent: "center", paddingRight: 2 },
    movie: { color: C.text, fontSize: isWide ? 21 : 14, fontWeight: "800", lineHeight: isWide ? 28 : 19 },
    episode: { color: C.amber, fontSize: isWide ? 15 : 11, fontWeight: "700", marginTop: 6 },
    server: { color: C.muted, fontSize: isWide ? 13 : 10, marginTop: 3 },
    lastOpened: { color: C.muted, fontSize: isWide ? 12 : 9, marginTop: 6 },
    continueButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: isWide ? 11 : 8, marginTop: 9, borderRadius: 9, backgroundColor: C.amber },
    continueText: { color: C.accentText, fontSize: isWide ? 11 : 8, fontWeight: "900", letterSpacing: 0.5 },
    remove: { width: isWide ? 48 : 32, height: isWide ? 48 : 32, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: C.surfaceRaised },
    empty: { flex: 1, minHeight: isWide ? 420 : 280, alignItems: "center", justifyContent: "center", paddingHorizontal: 26 },
    emptyIcon: { width: isWide ? 82 : 62, height: isWide ? 82 : 62, borderRadius: 22, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line },
    emptyTitle: { color: C.text, fontSize: isWide ? 24 : 17, fontWeight: "900", marginTop: 14 },
    emptyBody: { color: C.muted, fontSize: isWide ? 16 : 11, lineHeight: isWide ? 23 : 17, textAlign: "center", marginTop: 6, maxWidth: 520 },
    browseButton: { minHeight: isWide ? 54 : 40, justifyContent: "center", paddingHorizontal: 16, marginTop: 15, borderRadius: 11, backgroundColor: C.amber },
    browseText: { color: C.accentText, fontSize: isWide ? 15 : 11, fontWeight: "900" },
    note: { color: C.muted, fontSize: isWide ? 12 : 9, lineHeight: 14, textAlign: "center", paddingVertical: 7 },
  });
}
