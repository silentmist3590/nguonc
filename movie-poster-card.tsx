import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { useMovieTheme } from "@/lib/theme-provider";
import type { MovieSummary } from "@/lib/nguonc";

export function MoviePosterCard({
  movie,
  onPress,
  width,
  imageHeight,
}: {
  movie: MovieSummary;
  onPress: () => void;
  width?: number;
  imageHeight?: number;
}) {
  const { colors: C } = useMovieTheme();
  const { width: viewportWidth } = useWindowDimensions();
  const cardWidth = width ?? (viewportWidth >= 1000 ? 194 : 126);
  const posterHeight = imageHeight ?? (viewportWidth >= 1000 ? 272 : 178);
  const styles = useMemo(() => createStyles(C), [C]);
  const imageUri = movie.posterUrl || movie.thumbUrl;

  return (
    <TvFocusablePressable
      accessibilityRole="button"
      accessibilityLabel={`Mở phim ${movie.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && styles.pressed]}
    >
      <View style={[styles.posterWrap, { height: posterHeight }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={160} />
        ) : (
          <View style={styles.posterFallback}>
            <MaterialCommunityIcons name="movie-open-outline" size={30} color={C.amber} />
          </View>
        )}
        {movie.quality ? (
          <View style={styles.qualityBadge}><Text style={styles.qualityText}>{movie.quality}</Text></View>
        ) : null}
        <View style={styles.bottomShade} />
      </View>
      <Text numberOfLines={2} style={styles.title}>{movie.name}</Text>
      <Text numberOfLines={1} style={styles.meta}>{[movie.year, movie.currentEpisode].filter(Boolean).join(" · ")}</Text>
    </TvFocusablePressable>
  );
}

function createStyles(C: ReturnType<typeof useMovieTheme>["colors"]) {
  return StyleSheet.create({
    card: { marginRight: 16, padding: 2, borderRadius: 16 },
    pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
    posterWrap: { width: "100%", borderRadius: 13, overflow: "hidden", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
    posterFallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceRaised },
    qualityBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, backgroundColor: "rgba(9,11,18,0.84)" },
    qualityText: { color: C.amber, fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
    bottomShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 30, backgroundColor: "rgba(0,0,0,0.14)" },
    title: { color: C.text, fontSize: 15, fontWeight: "700", marginTop: 9, lineHeight: 20 },
    meta: { color: C.muted, fontSize: 12, marginTop: 3 },
  });
}
