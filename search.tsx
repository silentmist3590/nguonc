import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { useMovieTheme } from "@/lib/theme-provider";
import { hasApiBaseUrl } from "@/constants/oauth";
import { trpc } from "@/lib/trpc";
import type { MovieSummary } from "@/lib/nguonc";

export default function SearchScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors: C } = useMovieTheme();
  const isWide = width >= 920 || Boolean((Platform as typeof Platform & { isTV?: boolean }).isTV);
  const styles = useMemo(() => createStyles(C, isWide), [C, isWide]);
  const apiConfigured = hasApiBaseUrl();
  const [value, setValue] = useState("");
  const [term, setTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setTerm(value.trim()), 360);
    return () => clearTimeout(timer);
  }, [value]);
  const query = trpc.movie.search.useQuery(
    { keyword: term, page: 1 },
    { enabled: apiConfigured && term.length >= 2, staleTime: 30_000 },
  );
  const openMovie = (movie: MovieSummary) => router.push({ pathname: "/movie/[slug]", params: { slug: movie.slug } });

  return (
    <ScreenContainer>
      <View style={styles.page}>
        <Text style={styles.kicker}>TÌM TRONG KHO PHIM</Text>
        <Text style={styles.title}>Tìm kiếm</Text>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={isWide ? 28 : 21} color={C.amber} />
          <TextInput
            value={value}
            onChangeText={setValue}
            style={styles.input}
            placeholder="Tên phim bạn muốn xem…"
            placeholderTextColor={C.placeholder}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            autoFocus={isWide}
            focusable
            accessibilityLabel="Tìm kiếm phim"
          />
          {value ? <TvFocusablePressable onPress={() => setValue("")} hitSlop={10} accessibilityLabel="Xóa tìm kiếm"><MaterialCommunityIcons name="close-circle" size={19} color={C.muted} /></TvFocusablePressable> : null}
        </View>
        {term.length < 2 ? (
          <View style={styles.hint}><MaterialCommunityIcons name="movie-search-outline" size={isWide ? 44 : 32} color={C.amber} /><Text style={styles.hintTitle}>Bạn đang tìm bộ phim nào?</Text><Text style={styles.hintBody}>Nhập ít nhất 2 ký tự để tìm trong Nguồn C.</Text></View>
        ) : !apiConfigured ? (
          <View style={styles.state}><MaterialCommunityIcons name="cloud-alert-outline" size={isWide ? 38 : 28} color={C.amber} /><Text style={styles.stateTitle}>API chưa được cấu hình</Text><Text style={styles.stateText}>Phiên bản này chưa nhận được địa chỉ máy chủ phim.</Text></View>
        ) : query.isLoading || query.isFetching ? (
          <View style={styles.state}><ActivityIndicator color={C.amber} /><Text style={styles.stateText}>Đang tìm “{term}”…</Text></View>
        ) : query.isError ? (
          <View style={styles.state}><MaterialCommunityIcons name="cloud-alert-outline" size={isWide ? 38 : 28} color={C.amber} /><Text style={styles.stateTitle}>Không tải được kết quả</Text><Text style={styles.stateText}>{query.error.message}</Text><TvFocusablePressable style={styles.retry} onPress={() => { void query.refetch(); }}><Text style={styles.retryText}>Thử lại</Text></TvFocusablePressable></View>
        ) : query.data?.items.length ? (
          <ScrollView style={styles.results} contentContainerStyle={styles.resultList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.resultCount}>{query.data.pagination.totalItems.toLocaleString("vi-VN")} kết quả · “{term}”</Text>
            {query.data.items.map((movie) => (
              <TvFocusablePressable key={movie.slug} style={({ pressed }) => [styles.result, pressed && styles.pressed]} onPress={() => openMovie(movie)} accessibilityRole="button" accessibilityLabel={`Mở ${movie.name}`}>
                <View style={styles.poster}>
                  {movie.posterUrl || movie.thumbUrl ? <Image source={{ uri: movie.posterUrl || movie.thumbUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={140} /> : <MaterialCommunityIcons name="movie-open-outline" size={25} color={C.amber} />}
                </View>
                <View style={styles.resultCopy}>
                  <Text style={styles.movieName} numberOfLines={2}>{movie.name}</Text>
                  {!!movie.originalName && <Text style={styles.originalName} numberOfLines={1}>{movie.originalName}</Text>}
                  <Text style={styles.meta}>{[movie.year, movie.quality, movie.currentEpisode].filter(Boolean).join(" · ")}</Text>
                  {!!movie.description && <Text style={styles.description} numberOfLines={3}>{movie.description}</Text>}
                  <View style={styles.detailsLink}><Text style={styles.detailsText}>Xem chi tiết</Text><MaterialCommunityIcons name="arrow-right" size={14} color={C.amber} /></View>
                </View>
              </TvFocusablePressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.state}><MaterialCommunityIcons name="movie-off-outline" size={isWide ? 40 : 30} color={C.muted} /><Text style={styles.stateTitle}>Chưa tìm thấy phim phù hợp</Text><Text style={styles.stateText}>Thử từ khóa khác hoặc kiểm tra lại chính tả.</Text></View>
        )}
      </View>
    </ScreenContainer>
  );
}

function createStyles(C: ReturnType<typeof import("@/lib/theme-provider").useMovieTheme>["colors"], isWide: boolean) {
  return StyleSheet.create({
    page: { flex: 1, width: "100%", maxWidth: isWide ? 1180 : undefined, alignSelf: "center", paddingHorizontal: isWide ? 42 : 20, paddingTop: isWide ? 28 : 18 },
    kicker: { color: C.amber, fontSize: isWide ? 12 : 9, fontWeight: "800", letterSpacing: 1.8 },
    title: { color: C.text, fontSize: isWide ? 38 : 26, fontWeight: "900", marginTop: 4, marginBottom: isWide ? 22 : 18 },
    searchBox: { height: isWide ? 66 : 50, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, paddingHorizontal: isWide ? 18 : 13, flexDirection: "row", alignItems: "center", gap: 10 },
    input: { flex: 1, color: C.text, fontSize: isWide ? 21 : 14, paddingVertical: 0 },
    hint: { flex: 1, minHeight: isWide ? 400 : 270, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
    hintTitle: { color: C.text, fontSize: isWide ? 23 : 15, fontWeight: "800", marginTop: 14 },
    hintBody: { color: C.muted, fontSize: isWide ? 16 : 12, textAlign: "center", marginTop: 6, lineHeight: isWide ? 24 : 18 },
    state: { flex: 1, minHeight: isWide ? 350 : 250, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
    stateTitle: { color: C.text, fontSize: isWide ? 22 : 14, fontWeight: "800", textAlign: "center", marginTop: 5 },
    stateText: { color: C.muted, fontSize: isWide ? 16 : 11, textAlign: "center", lineHeight: isWide ? 24 : 17, maxWidth: 550 },
    retry: { minHeight: isWide ? 50 : 36, justifyContent: "center", borderColor: C.amberSoft, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginTop: 7 },
    retryText: { color: C.amber, fontWeight: "800", fontSize: isWide ? 14 : 11 },
    results: { flex: 1, marginTop: isWide ? 20 : 18 },
    resultList: { width: "100%", maxWidth: isWide ? 990 : undefined, alignSelf: "center", paddingBottom: 22 },
    resultCount: { color: C.muted, fontSize: isWide ? 13 : 10, marginBottom: 12 },
    result: { flexDirection: "row", gap: isWide ? 22 : 13, padding: isWide ? 16 : 10, marginBottom: 12, borderRadius: 15, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
    pressed: { opacity: 0.8 },
    poster: { width: isWide ? 132 : 82, height: isWide ? 196 : 122, overflow: "hidden", borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceRaised },
    resultCopy: { flex: 1, justifyContent: "center" },
    movieName: { color: C.text, fontSize: isWide ? 22 : 14, lineHeight: isWide ? 29 : 19, fontWeight: "800" },
    originalName: { color: C.muted, fontSize: isWide ? 14 : 10, marginTop: 3 },
    meta: { color: C.amber, fontSize: isWide ? 13 : 9, fontWeight: "700", marginTop: 7 },
    description: { color: C.muted, fontSize: isWide ? 14 : 10, lineHeight: isWide ? 21 : 15, marginTop: 7 },
    detailsLink: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 9 },
    detailsText: { color: C.amber, fontSize: isWide ? 13 : 10, fontWeight: "800" },
  });
}
