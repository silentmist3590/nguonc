import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { MoviePlayer } from "@/components/movie-player";
import { useMovieTheme } from "@/lib/theme-provider";
import { hasApiBaseUrl } from "@/constants/oauth";
import { trpc } from "@/lib/trpc";
import { safeHttpsUrl } from "@/lib/nguonc";
import { removeWatchProgress, saveWatchProgress } from "@/lib/watch-progress";
import { useWatchHistory } from "@/hooks/use-watch-history";

function routeString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function WatchScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors: C } = useMovieTheme();
  const isWide = width >= 1000 || Boolean((Platform as typeof Platform & { isTV?: boolean }).isTV);
  const styles = useMemo(() => createStyles(C, isWide), [C, isWide]);
  const params = useLocalSearchParams<{
    slug?: string | string[];
    movieName?: string | string[];
    posterUrl?: string | string[];
    episodeSlug?: string | string[];
    episodeName?: string | string[];
    serverName?: string | string[];
  }>();
  const movieSlug = routeString(params.slug);
  const movieName = routeString(params.movieName) || "Đang phát";
  const posterUrl = safeHttpsUrl(routeString(params.posterUrl)) ?? "";
  const episodeSlug = routeString(params.episodeSlug) || "tap-1";
  const episodeName = routeString(params.episodeName) || "Tập phim";
  const serverName = routeString(params.serverName) || "Nguồn phát";
  const apiConfigured = hasApiBaseUrl();
  const { user, auth, scope, scopeReady, canRecordLocalHistory, refreshLocal } = useWatchHistory();
  const details = trpc.movie.detail.useQuery({ slug: movieSlug }, { enabled: !!movieSlug && apiConfigured, staleTime: 180_000 });
  const syncMutation = trpc.history.sync.useMutation();
  const removeMutation = trpc.history.remove.useMutation();
  const utils = trpc.useUtils();
  const [removed, setRemoved] = useState(false);
  const [actionError, setActionError] = useState("");
  const recordedKey = useRef("");

  const episodes = useMemo(() => (details.data?.episodes ?? []).flatMap((group) => group.items.map((episode) => ({ ...episode, serverName: group.serverName }))), [details.data]);
  const matchedEpisode = episodes.find((episode) => episode.slug === episodeSlug && episode.serverName === serverName)
    ?? episodes.find((episode) => episode.slug === episodeSlug);
  const trustedEmbedUrl = apiConfigured && details.isSuccess ? safeHttpsUrl(matchedEpisode?.embedUrl) : undefined;
  const activeEpisodeName = matchedEpisode?.name ?? episodeName;
  const activeServerName = matchedEpisode?.serverName ?? serverName;
  const waitingForAuth = apiConfigured && (auth.isLoading || !scopeReady);

  useEffect(() => {
    if (!movieSlug || !matchedEpisode || !trustedEmbedUrl || removed || waitingForAuth || !canRecordLocalHistory) return;
    const identity = `${scope}:${movieSlug}:${matchedEpisode.slug}:${matchedEpisode.serverName}`;
    if (recordedKey.current === identity) return;
    recordedKey.current = identity;
    void (async () => {
      try {
        const saved = await saveWatchProgress({
          movieSlug,
          movieName,
          posterUrl,
          episodeSlug: matchedEpisode.slug,
          episodeName: matchedEpisode.name,
          serverName: matchedEpisode.serverName,
          updatedAt: Date.now(),
        }, scope);
        if (!saved) return;
        await refreshLocal();
        if (user?.openId) {
          try {
            await syncMutation.mutateAsync({ items: [saved] });
            await utils.history.list.invalidate();
          } catch {
            // Keep the account-scoped record locally for a later manual sync.
          }
        }
      } catch {
        // Playback is independent from optional local history storage.
      }
    })();
  }, [movieSlug, movieName, posterUrl, matchedEpisode, trustedEmbedUrl, removed, waitingForAuth, canRecordLocalHistory, scopeReady, scope, refreshLocal, user?.openId, syncMutation, utils.history.list]);

  const switchEpisode = (episode: (typeof episodes)[number]) => {
    setRemoved(false);
    setActionError("");
    return router.replace({
      pathname: "/watch/[slug]",
      params: { slug: movieSlug, movieName, posterUrl, episodeSlug: episode.slug, episodeName: episode.name, serverName: episode.serverName },
    });
  };

  const forgetProgress = async () => {
    if (!matchedEpisode || auth.isLoading || !scopeReady) return;
    setActionError("");
    try {
      if (user?.openId) {
        await removeMutation.mutateAsync({ movieSlug, episodeSlug: matchedEpisode.slug, serverName: matchedEpisode.serverName });
      }
      await removeWatchProgress(movieSlug, matchedEpisode.slug, matchedEpisode.serverName, scope);
      await refreshLocal();
      if (user?.openId) await utils.history.list.invalidate();
      setRemoved(true);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không xóa được mục khỏi lịch sử.");
    }
  };

  const playerContent = !apiConfigured ? (
    <View style={styles.invalid}><MaterialCommunityIcons name="cloud-alert-outline" size={isWide ? 36 : 28} color={C.amber} /><Text style={styles.invalidTitle}>API chưa được cấu hình</Text><Text style={styles.note}>Ứng dụng chưa nhận được địa chỉ máy chủ phim để xác minh tập.</Text></View>
  ) : details.isLoading ? (
    <View style={styles.invalid}><ActivityIndicator color={C.amber} /><Text style={styles.note}>Đang xác minh tập phim…</Text></View>
  ) : details.isError ? (
    <View style={styles.invalid}><MaterialCommunityIcons name="cloud-alert-outline" size={isWide ? 36 : 28} color={C.amber} /><Text style={styles.invalidTitle}>Không tải được thông tin tập</Text><Text style={styles.note}>{details.error.message}</Text><TvFocusablePressable style={styles.retryButton} onPress={() => { void details.refetch(); }}><Text style={styles.retryText}>Thử lại</Text></TvFocusablePressable></View>
  ) : trustedEmbedUrl ? (
    <MoviePlayer key={trustedEmbedUrl} uri={trustedEmbedUrl} title={`${movieName} — ${activeEpisodeName}`} />
  ) : (
    <View style={styles.invalid}><MaterialCommunityIcons name="link-off" size={isWide ? 36 : 28} color={C.amber} /><Text style={styles.invalidTitle}>Không tìm thấy tập trong dữ liệu phim</Text><Text style={styles.note}>Liên kết chỉ được mở khi khớp với tập do API Nguồn C trả về. Hãy chọn lại tập từ chi tiết phim.</Text></View>
  );

  return (
    <ScreenContainer>
      <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TvFocusablePressable style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại chi tiết phim"><MaterialCommunityIcons name="arrow-left" size={isWide ? 25 : 20} color={C.text} /></TvFocusablePressable>
          <View style={styles.headerCopy}><Text style={styles.kicker}>ĐANG PHÁT</Text><Text style={styles.title} numberOfLines={1}>{movieName}</Text></View>
        </View>
        <View style={isWide ? styles.columns : undefined}>
          <View style={isWide ? styles.mainColumn : undefined}>
            {playerContent}
            <View style={styles.nowPlaying}>
              <View style={styles.playDot}><MaterialCommunityIcons name="play" size={13} color={C.accentText} /></View>
              <View style={styles.nowCopy}><Text style={styles.episode}>{activeEpisodeName}</Text><Text style={styles.server}>{activeServerName}</Text></View>
              <MaterialCommunityIcons name="cast" size={isWide ? 23 : 18} color={C.muted} />
            </View>
            <Text style={styles.note}>Liên kết được xác minh với tập trong API. Ứng dụng chỉ ghi nhớ phim và tập vừa mở; vị trí phát không được nguồn cung cấp.</Text>
          </View>
          <View style={isWide ? styles.sideColumn : undefined}>
            {episodes.length > 1 ? (
              <View style={styles.episodeSection}>
                <Text style={styles.sectionTitle}>Các tập khác</Text>
                <View style={isWide ? styles.tvEpisodeList : undefined}>
                  {episodes.map((episode) => {
                    const selected = episode.slug === episodeSlug && episode.serverName === serverName;
                    return <TvFocusablePressable key={`${episode.serverName}:${episode.slug}`} style={({ pressed }) => [styles.episodeChip, isWide && styles.episodeChipWide, selected && styles.episodeChipSelected, pressed && styles.pressed]} onPress={() => { void switchEpisode(episode); }} accessibilityRole="button" accessibilityState={{ selected }}><MaterialCommunityIcons name={selected ? "play-circle" : "play-circle-outline"} size={isWide ? 20 : 16} color={selected ? C.amber : C.muted} /><Text style={[styles.episodeChipText, selected && styles.episodeChipTextSelected]} numberOfLines={1}>{episode.name} · {episode.serverName}</Text></TvFocusablePressable>;
                  })}
                </View>
              </View>
            ) : null}
            <TvFocusablePressable style={styles.forgetButton} onPress={() => { void forgetProgress(); }} disabled={removeMutation.isPending || auth.isLoading || !scopeReady} accessibilityRole="button">
              <MaterialCommunityIcons name={removed ? "check" : "bookmark-remove-outline"} size={isWide ? 20 : 16} color={removed ? C.amber : C.muted} />
              <Text style={[styles.forgetText, removed && { color: C.amber }]}>{removed ? "Đã bỏ khỏi danh sách Đang xem" : "Bỏ phim này khỏi Đang xem dở"}</Text>
            </TvFocusablePressable>
            {!!actionError && <Text style={styles.actionError}>{actionError}</Text>}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(C: ReturnType<typeof import("@/lib/theme-provider").useMovieTheme>["colors"], isWide: boolean) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: C.background },
    content: { width: "100%", maxWidth: isWide ? 1500 : undefined, alignSelf: "center", paddingHorizontal: isWide ? 44 : 16, paddingTop: isWide ? 20 : 12, paddingBottom: 25 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: isWide ? 20 : 14, gap: 11 },
    back: { width: isWide ? 52 : 38, height: isWide ? 52 : 38, borderRadius: isWide ? 16 : 12, alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
    headerCopy: { flex: 1 },
    kicker: { color: C.amber, fontSize: isWide ? 11 : 8, fontWeight: "900", letterSpacing: 1.5 },
    title: { color: C.text, fontSize: isWide ? 23 : 16, fontWeight: "800", marginTop: 3 },
    columns: { flexDirection: "row", alignItems: "flex-start", gap: 28 },
    mainColumn: { flex: 1.65, minWidth: 480 },
    sideColumn: { flex: 1, minWidth: 320, paddingTop: 3 },
    nowPlaying: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: isWide ? 18 : 14, borderBottomWidth: 1, borderBottomColor: C.line },
    playDot: { width: isWide ? 34 : 25, height: isWide ? 34 : 25, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: C.amber },
    nowCopy: { flex: 1 },
    episode: { color: C.text, fontSize: isWide ? 17 : 13, fontWeight: "800" },
    server: { color: C.muted, fontSize: isWide ? 13 : 10, marginTop: 3 },
    note: { color: C.muted, fontSize: isWide ? 12 : 10, lineHeight: isWide ? 18 : 16, marginTop: 10 },
    invalid: { width: "100%", aspectRatio: 16 / 9, minHeight: isWide ? 270 : undefined, alignItems: "center", justifyContent: "center", padding: 20, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
    invalidTitle: { color: C.text, fontSize: isWide ? 19 : 13, fontWeight: "800", marginTop: 7, textAlign: "center" },
    retryButton: { minHeight: isWide ? 48 : 36, justifyContent: "center", borderColor: C.amberSoft, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginTop: 7 },
    retryText: { color: C.amber, fontSize: isWide ? 14 : 11, fontWeight: "800" },
    episodeSection: { marginTop: isWide ? 0 : 17 },
    sectionTitle: { color: C.text, fontSize: isWide ? 21 : 14, fontWeight: "800", marginBottom: 10 },
    tvEpisodeList: { maxHeight: 520 },
    episodeChip: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 8, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
    episodeChipWide: { minHeight: 52, paddingHorizontal: 15 },
    episodeChipSelected: { borderColor: C.amber, backgroundColor: C.amberSoft },
    episodeChipText: { flex: 1, color: C.muted, fontSize: isWide ? 14 : 10, fontWeight: "700" },
    episodeChipTextSelected: { color: C.text },
    pressed: { opacity: 0.8 },
    forgetButton: { minHeight: isWide ? 50 : 40, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 7, paddingHorizontal: isWide ? 12 : 2, paddingVertical: 10, marginTop: 12, borderRadius: 10 },
    forgetText: { color: C.muted, fontSize: isWide ? 12 : 10, fontWeight: "700" },
    actionError: { color: C.wine, fontSize: isWide ? 13 : 10, marginTop: 8 },
  });
}
