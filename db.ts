import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, watchHistory } from "../drizzle/schema";
import { ENV } from "./_core/env";

export type WatchHistoryEntry = {
  movieSlug: string;
  movieName: string;
  posterUrl: string;
  episodeSlug: string;
  episodeName: string;
  serverName: string;
  updatedAt: number;
};

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch {
      console.warn("[Database] Failed to connect");
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user");
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

function toWatchHistoryEntry(row: typeof watchHistory.$inferSelect): WatchHistoryEntry {
  return {
    movieSlug: row.movieSlug,
    movieName: row.movieName,
    posterUrl: row.posterUrl,
    episodeSlug: row.episodeSlug,
    episodeName: row.episodeName,
    serverName: row.serverName,
    updatedAt: row.lastOpenedAt.getTime(),
  };
}

export async function listWatchHistory(userId: number): Promise<WatchHistoryEntry[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const rows = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.userId, userId))
    .orderBy(desc(watchHistory.lastOpenedAt))
    .limit(80);
  return rows.map(toWatchHistoryEntry);
}

export async function syncWatchHistory(
  userId: number,
  items: WatchHistoryEntry[],
): Promise<WatchHistoryEntry[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  await db.transaction(async (tx) => {
    for (const item of items) {
      const identity = and(
        eq(watchHistory.userId, userId),
        eq(watchHistory.movieSlug, item.movieSlug),
        eq(watchHistory.episodeSlug, item.episodeSlug),
        eq(watchHistory.serverName, item.serverName),
      );
      const [existing] = await tx.select().from(watchHistory).where(identity).limit(1);
      const candidateDate = new Date(Math.min(item.updatedAt, Date.now()));
      if (existing && existing.lastOpenedAt.getTime() > candidateDate.getTime()) continue;

      const values = {
        userId,
        movieSlug: item.movieSlug,
        movieName: item.movieName,
        posterUrl: item.posterUrl,
        episodeSlug: item.episodeSlug,
        episodeName: item.episodeName,
        serverName: item.serverName,
        lastOpenedAt: candidateDate,
      };
      await tx.insert(watchHistory).values(values).onDuplicateKeyUpdate({ set: values });
    }
  });

  return listWatchHistory(userId);
}

export async function removeWatchHistory(
  userId: number,
  identity: { movieSlug: string; episodeSlug: string; serverName: string },
): Promise<{ success: true }> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.delete(watchHistory).where(and(
    eq(watchHistory.userId, userId),
    eq(watchHistory.movieSlug, identity.movieSlug),
    eq(watchHistory.episodeSlug, identity.episodeSlug),
    eq(watchHistory.serverName, identity.serverName),
  ));
  return { success: true };
}
