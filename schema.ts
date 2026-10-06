import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const watchHistory = mysqlTable("watch_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieSlug: varchar("movieSlug", { length: 160 }).notNull(),
  movieName: varchar("movieName", { length: 240 }).notNull(),
  posterUrl: text("posterUrl").notNull(),
  episodeSlug: varchar("episodeSlug", { length: 160 }).notNull(),
  episodeName: varchar("episodeName", { length: 100 }).notNull(),
  serverName: varchar("serverName", { length: 100 }).notNull(),
  lastOpenedAt: timestamp("lastOpenedAt").defaultNow().notNull(),
}, (table) => ({
  uniqueIdentity: uniqueIndex("watch_history_user_movie_episode_server_uq").on(
    table.userId,
    table.movieSlug,
    table.episodeSlug,
    table.serverName,
  ),
  userRecent: index("watch_history_user_recent_idx").on(table.userId, table.lastOpenedAt),
}));

export type WatchHistory = typeof watchHistory.$inferSelect;
