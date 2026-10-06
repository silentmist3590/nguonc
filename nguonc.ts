export type MovieEpisode = {
  name: string;
  slug: string;
  embedUrl: string;
};

export type MovieEpisodeGroup = {
  serverName: string;
  items: MovieEpisode[];
};

export type MovieSummary = {
  slug: string;
  name: string;
  originalName: string;
  posterUrl: string;
  thumbUrl: string;
  description: string;
  year: string;
  time: string;
  quality: string;
  language: string;
  currentEpisode: string;
  totalEpisodes: string;
  director: string[];
  casts: string[];
  categories: string[];
  episodes: MovieEpisodeGroup[];
};

export type MoviePage = {
  items: MovieSummary[];
  pagination: {
    currentPage: number;
    totalPage: number;
    totalItems: number;
  };
};

export function safeHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}
