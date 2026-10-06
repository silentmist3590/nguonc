import AsyncStorage from "@react-native-async-storage/async-storage";
import { safeHttpsUrl } from "@/lib/nguonc";
import { GUEST_HISTORY_SCOPE } from "./watch-history-identity";
export { GUEST_HISTORY_SCOPE, historyScopeForUser, resolveWatchHistoryIdentity } from "./watch-history-identity";

const STORAGE_PREFIX = "phimviet.watch-progress.v2:";
const LEGACY_STORAGE_KEY = "phimviet.watch-progress.v1";
const MAX_ITEMS = 80;

export type WatchProgress = {
  movieSlug: string;
  movieName: string;
  posterUrl: string;
  episodeSlug: string;
  episodeName: string;
  serverName: string;
  updatedAt: number;
};

function getStorageKey(scope: string): string {
  const safeScope = scope === GUEST_HISTORY_SCOPE || scope.startsWith("account:")
    ? scope
    : GUEST_HISTORY_SCOPE;
  return `${STORAGE_PREFIX}${encodeURIComponent(safeScope)}`;
}

function identityKey(item: Pick<WatchProgress, "movieSlug" | "episodeSlug" | "serverName">): string {
  return `${item.movieSlug}\u0000${item.episodeSlug}\u0000${item.serverName}`;
}

function sanitizeProgress(value: unknown): WatchProgress | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<WatchProgress>;
  if (typeof item.movieSlug !== "string" || !/^[a-zA-Z0-9-]{1,160}$/.test(item.movieSlug)) return null;
  if (typeof item.episodeSlug !== "string" || !/^[a-zA-Z0-9_-]{1,160}$/.test(item.episodeSlug)) return null;
  if (typeof item.movieName !== "string" || !item.movieName.trim()) return null;
  if (typeof item.episodeName !== "string" || !item.episodeName.trim()) return null;
  if (typeof item.serverName !== "string" || !item.serverName.trim()) return null;
  if (typeof item.posterUrl !== "string") return null;
  if (item.posterUrl && !safeHttpsUrl(item.posterUrl)) return null;
  if (typeof item.updatedAt !== "number" || !Number.isFinite(item.updatedAt) || item.updatedAt < 0) return null;

  return {
    movieSlug: item.movieSlug,
    movieName: item.movieName.trim().slice(0, 240),
    posterUrl: safeHttpsUrl(item.posterUrl) ?? "",
    episodeSlug: item.episodeSlug,
    episodeName: item.episodeName.trim().slice(0, 100),
    serverName: item.serverName.trim().slice(0, 100),
    updatedAt: Math.min(Math.trunc(item.updatedAt), 4_102_444_800_000),
  };
}

export function mergeWatchProgress(...groups: readonly WatchProgress[][]): WatchProgress[] {
  const merged = new Map<string, WatchProgress>();
  for (const group of groups) {
    for (const candidate of group) {
      const item = sanitizeProgress(candidate);
      if (!item) continue;
      const key = identityKey(item);
      const current = merged.get(key);
      if (!current || item.updatedAt > current.updatedAt) merged.set(key, item);
    }
  }
  return Array.from(merged.values()).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_ITEMS);
}

async function parseItems(raw: string | null): Promise<WatchProgress[]> {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? mergeWatchProgress(parsed.map((item) => sanitizeProgress(item)).filter((item): item is WatchProgress => item !== null))
      : [];
  } catch {
    return [];
  }
}

export async function getWatchProgress(scope = GUEST_HISTORY_SCOPE): Promise<WatchProgress[]> {
  try {
    const key = getStorageKey(scope);
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) return parseItems(raw);

    if (scope === GUEST_HISTORY_SCOPE) {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      const legacyItems = await parseItems(legacyRaw);
      if (legacyRaw !== null) {
        await AsyncStorage.setItem(key, JSON.stringify(legacyItems));
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      return legacyItems;
    }
    return [];
  } catch {
    return [];
  }
}

export async function replaceWatchProgress(items: readonly WatchProgress[], scope = GUEST_HISTORY_SCOPE): Promise<void> {
  const normalized = mergeWatchProgress([...items]);
  await AsyncStorage.setItem(getStorageKey(scope), JSON.stringify(normalized));
}

export async function saveWatchProgress(
  progress: Omit<WatchProgress, "updatedAt"> & { updatedAt?: number },
  scope = GUEST_HISTORY_SCOPE,
): Promise<WatchProgress | null> {
  const next = sanitizeProgress({ ...progress, updatedAt: Date.now() });
  if (!next) return null;
  const current = await getWatchProgress(scope);
  await replaceWatchProgress([next, ...current.filter((item) => identityKey(item) !== identityKey(next))], scope);
  return next;
}

export async function removeWatchProgress(
  movieSlug: string,
  episodeSlug: string,
  serverName?: string,
  scope = GUEST_HISTORY_SCOPE,
): Promise<void> {
  const current = await getWatchProgress(scope);
  const next = current.filter((item) => {
    const sameMovieEpisode = item.movieSlug === movieSlug && item.episodeSlug === episodeSlug;
    return !sameMovieEpisode || (serverName !== undefined && item.serverName !== serverName);
  });
  await replaceWatchProgress(next, scope);
}

export async function clearWatchProgress(scope = GUEST_HISTORY_SCOPE): Promise<void> {
  await AsyncStorage.removeItem(getStorageKey(scope));
  if (scope === GUEST_HISTORY_SCOPE) await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
}
