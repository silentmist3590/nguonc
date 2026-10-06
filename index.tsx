import { useMemo } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { MoviePosterCard } from "@/components/movie-poster-card";
import { hasApiBaseUrl } from "@/constants/oauth";
import { useMovieTheme } from "@/lib/theme-provider";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { trpc } from "@/lib/trpc";
import type { WatchProgress } from "@/lib/watch-progress";
import type { MovieSummary } from "@/lib/nguonc";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors: C } = useMovieTheme();
  const isWide = width >= 920 || Boolean((Platform as typeof Platform & { isTV?: boolean }).isTV);
  const styles = useMemo(() => createStyles(C, isWide), [C, isWide]);
  const apiConfigured = hasApiBaseUrl();
  const movies = trpc.movie.latest.useQuery({ page: 1 }, { enabled: apiConfigured, staleTime: 120_000 });
  const { items: recent } = useWatchHistory();

  const openMovie = (movie: MovieSummary) => router.push({ pathname: "/movie/[slug]", params: { slug: movie.slug } });
  const openProgress = (item: WatchProgress) => router.push({
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
  const hero = movies.data?.items[0];

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor={C.amber} colors={[C.amber]} refreshing={movies.isRefetching} onRefresh={() => { if (apiConfigured) void movies.refetch(); }} />}
      >
        <View style={styles.topbar}>
          <View style={styles.brandMark}>
            {Platform.OS === "web" ? <Image source={{ uri: "/manus-storage/async-images/tFbF87yrZYrRgTUXz8VqiK/image-1.webp" }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <MaterialCommunityIcons name="play-box-multiple" size={isWide ? 27 : 21} color={C.accentText} />}
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>PHIM VIỆT</Text>
            <Text style={styles.brandCaption}>RẠP RIÊNG CỦA BẠN</Text>
          </View>
          <TvFocusablePressable style={styles.topIcon} onPress={() => router.push("/(tabs)/search")} accessibilityRole="button" accessibilityLabel="Tìm kiếm phim">
            <MaterialCommunityIcons name="magnify" size={isWide ? 29 : 23} color={C.text} />
          </TvFocusablePressable>
          <TvFocusablePressable style={styles.topIcon} onPress={() => router.push("/(tabs)/account")} accessibilityRole="button" accessibilityLabel="Mở tài khoản">
            <MaterialCommunityIcons name="account-circle-outline" size={isWide ? 29 : 23} color={C.text} />
          </TvFocusablePressable>
        </View>

        <View style={styles.headlineRow}>
          <View><Text style={styles.eyebrow}>PHIM MỚI CẬP NHẬT</Text><Text style={styles.headline}>Tối nay, xem gì?</Text></View>
          <View style={styles.liveTag}><View style={styles.liveDot} /><Text style={styles.liveText}>NGUỒN C</Text></View>
        </View>

        {!apiConfigured ? (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="cloud-alert-outline" size={isWide ? 34 : 25} color={C.amber} />
            <Text style={styles.errorTitle}>API chưa được cấu hình</Text>
            <Text style={styles.errorBody}>Phiên bản này chưa nhận được địa chỉ máy chủ phim. Hãy dùng Preview có API hoặc cấu hình endpoint trước khi build.</Text>
          </View>
        ) : movies.isLoading ? (
          <View style={styles.heroLoading}><ActivityIndicator color={C.amber} /><Text style={styles.loadingText}>Đang tìm phim mới…</Text></View>
        ) : movies.isError ? (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="cloud-alert-outline" size={isWide ? 34 : 25} color={C.amber} />
            <Text style={styles.errorTitle}>Chưa tải được danh sách phim</Text>
            <Text style={styles.errorBody}>{movies.error.message}</Text>
            <TvFocusablePressable style={styles.outlineButton} onPress={() => { void movies.refetch(); }}><Text style={styles.outlineButtonText}>Thử lại</Text></TvFocusablePressable>
          </View>
        ) : hero ? (
          <TvFocusablePressable style={styles.heroCard} onPress={() => openMovie(hero)} accessibilityRole="button" accessibilityLabel={`Xem chi tiết ${hero.name}`}>
            {hero.thumbUrl || hero.posterUrl ? <Image source={{ uri: hero.thumbUrl || hero.posterUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} /> : null}
            <View style={styles.heroScrim} />
            <View style={styles.heroTopPill}><MaterialCommunityIcons name="star-four-points" size={isWide ? 17 : 12} color={C.amber} /><Text style={styles.heroPillText}>VỪA LÊN SÓNG</Text></View>
            <View style={styles.heroContent}>
              <Text style={styles.heroMeta}>{[hero.year, hero.quality, hero.language].filter(Boolean).join("  ·  ")}</Text>
              <Text numberOfLines={2} style={styles.heroTitle}>{hero.name}</Text>
              <Text numberOfLines={2} style={styles.heroDescription}>{hero.description || "Khám phá thông tin và các tập phim mới nhất."}</Text>
              <View style={styles.playButton}><MaterialCommunityIcons name="play" size={isWide ? 24 : 19} color={C.accentText} /><Text style={styles.playButtonText}>XEM PHIM</Text></View>
            </View>
          </TvFocusablePressable>
        ) : null}

        {recent.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionKicker}>QUAY LẠI RẠP</Text><Text style={styles.sectionTitle}>Đang xem dở</Text></View>
              <TvFocusablePressable onPress={() => router.push("/(tabs)/continue")} accessibilityRole="button"><Text style={styles.seeAll}>Xem tất cả</Text></TvFocusablePressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.progressRail}>
              {recent.slice(0, 5).map((item) => (
                <TvFocusablePressable key={`${item.movieSlug}:${item.episodeSlug}:${item.serverName}`} style={styles.progressCard} onPress={() => openProgress(item)} accessibilityRole="button" accessibilityLabel={`Mở lại ${item.movieName}, ${item.episodeName}`}>
                  <View style={styles.progressPoster}>
                    {item.posterUrl ? <Image source={{ uri: item.posterUrl }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <View style={styles.posterFallback}><MaterialCommunityIcons name="movie-open-outline" size={isWide ? 30 : 24} color={C.amber} /></View>}
                    <View style={styles.progressPlay}><MaterialCommunityIcons name="play" size={16} color={C.accentText} /></View>
                  </View>
                  <Text style={styles.progressMovie} numberOfLines={1}>{item.movieName}</Text>
                  <Text style={styles.progressEpisode} numberOfLines={1}>{item.episodeName} · {item.serverName}</Text>
                </TvFocusablePressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {movies.data?.items?.length ? (
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionKicker}>MỚI NHẤT TỪ NGUỒN C</Text><Text style={styles.sectionTitle}>Vừa cập nhật</Text></View>
              <MaterialCommunityIcons name="arrow-right" size={isWide ? 25 : 20} color={C.muted} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.posterRail}>
              {movies.data.items.map((movie) => <MoviePosterCard key={movie.slug} movie={movie} onPress={() => openMovie(movie)} />)}
            </ScrollView>
          </View>
        ) : null}
        <View style={styles.footer}><Text style={styles.footerText}>Dữ liệu phim được cung cấp bởi API Nguồn C.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(C: ReturnType<typeof import("@/lib/theme-provider").useMovieTheme>["colors"], isWide: boolean) {
  return StyleSheet.create({
    content: { width: "100%", maxWidth: isWide ? 1440 : undefined, alignSelf: "center", paddingHorizontal: isWide ? 42 : 20, paddingTop: isWide ? 24 : 12, paddingBottom: 32 },
    topbar: { flexDirection: "row", alignItems: "center", gap: isWide ? 14 : 8, marginBottom: isWide ? 34 : 25 },
    brandMark: { width: isWide ? 54 : 38, height: isWide ? 54 : 38, borderRadius: isWide ? 17 : 12, overflow: "hidden", backgroundColor: C.amber, alignItems: "center", justifyContent: "center" },
    brandCopy: { marginLeft: 2, flex: 1 },
    brandName: { color: C.text, fontSize: isWide ? 22 : 14, fontWeight: "900", letterSpacing: 1.6 },
    brandCaption: { color: C.muted, fontSize: isWide ? 11 : 8, fontWeight: "700", letterSpacing: 1.6, marginTop: 3 },
    topIcon: { width: isWide ? 58 : 40, height: isWide ? 58 : 40, borderRadius: isWide ? 18 : 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
    headlineRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: isWide ? 18 : 14 },
    eyebrow: { color: C.amber, fontSize: isWide ? 12 : 9, fontWeight: "800", letterSpacing: 1.8 },
    headline: { color: C.text, fontSize: isWide ? 38 : 25, fontWeight: "800", letterSpacing: -0.6, marginTop: 5 },
    liveTag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: C.line, marginBottom: 3 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.wine, marginRight: 6 },
    liveText: { color: C.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
    heroCard: { height: isWide ? 430 : 330, borderRadius: isWide ? 26 : 20, overflow: "hidden", backgroundColor: C.surfaceRaised, borderWidth: 1, borderColor: C.line, justifyContent: "space-between" },
    heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: C.heroScrim },
    heroTopPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, margin: isWide ? 22 : 14, borderRadius: 99, backgroundColor: "rgba(9,11,18,0.8)" },
    heroPillText: { color: C.white, fontSize: isWide ? 11 : 8, fontWeight: "800", letterSpacing: 0.9 },
    heroContent: { padding: isWide ? 30 : 18, paddingTop: 0, maxWidth: isWide ? 760 : 380 },
    heroMeta: { color: C.amber, fontSize: isWide ? 14 : 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 6 },
    heroTitle: { color: C.white, fontSize: isWide ? 40 : 25, fontWeight: "900", lineHeight: isWide ? 48 : 31, letterSpacing: -0.4 },
    heroDescription: { color: "#DFE1E7", fontSize: isWide ? 16 : 11, lineHeight: isWide ? 24 : 16, marginTop: 7, maxWidth: isWide ? 550 : 310 },
    playButton: { minHeight: isWide ? 56 : 40, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: isWide ? 22 : 14, marginTop: 13, borderRadius: 11, backgroundColor: C.amber },
    playButtonText: { color: C.accentText, fontSize: isWide ? 14 : 10, fontWeight: "900", letterSpacing: 0.6 },
    heroLoading: { height: isWide ? 300 : 230, borderRadius: 20, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", gap: 10 },
    loadingText: { color: C.muted, fontSize: 12 },
    errorCard: { minHeight: isWide ? 240 : 180, padding: 18, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
    errorTitle: { color: C.text, fontSize: isWide ? 19 : 14, fontWeight: "800", marginTop: 9 },
    errorBody: { color: C.muted, fontSize: isWide ? 15 : 11, textAlign: "center", marginTop: 5, maxWidth: 580 },
    outlineButton: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: C.amberSoft, marginTop: 12 },
    outlineButtonText: { color: C.amber, fontWeight: "800", fontSize: 11 },
    section: { marginTop: isWide ? 42 : 27 },
    sectionHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: isWide ? 18 : 13 },
    sectionKicker: { color: C.amber, fontSize: isWide ? 11 : 8, fontWeight: "800", letterSpacing: 1.5 },
    sectionTitle: { color: C.text, fontSize: isWide ? 29 : 19, fontWeight: "800", marginTop: 3 },
    seeAll: { color: C.amber, fontSize: isWide ? 15 : 11, fontWeight: "700", paddingBottom: 3 },
    posterRail: { paddingHorizontal: 3, paddingTop: 4, paddingBottom: 8 },
    progressRail: { paddingHorizontal: 3, paddingTop: 4, paddingBottom: 8 },
    progressCard: { width: isWide ? 250 : 185, marginRight: isWide ? 20 : 12, padding: 3, borderRadius: 16 },
    progressPoster: { height: isWide ? 146 : 108, borderRadius: 12, overflow: "hidden", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
    progressPlay: { position: "absolute", right: 9, bottom: 9, width: isWide ? 40 : 29, height: isWide ? 40 : 29, borderRadius: 20, backgroundColor: C.amber, alignItems: "center", justifyContent: "center" },
    posterFallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceRaised },
    progressMovie: { color: C.text, fontSize: isWide ? 17 : 12, fontWeight: "800", marginTop: 7 },
    progressEpisode: { color: C.muted, fontSize: isWide ? 13 : 10, marginTop: 3 },
    footer: { alignItems: "center", marginTop: 28 },
    footerText: { color: C.muted, fontSize: isWide ? 12 : 9 },
  });
}
