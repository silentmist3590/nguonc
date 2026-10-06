import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { removeWatchHistory, syncWatchHistory, listWatchHistory } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const personalProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.id < 1) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to sync personal history." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

function isSafeHttpsUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

const historyItemSchema = z.object({
  movieSlug: z.string().regex(/^[a-zA-Z0-9-]{1,160}$/),
  movieName: z.string().trim().min(1).max(240),
  posterUrl: z.string().max(2048).refine(isSafeHttpsUrl, "Poster URL must use HTTPS"),
  episodeSlug: z.string().regex(/^[a-zA-Z0-9_-]{1,160}$/),
  episodeName: z.string().trim().min(1).max(100),
  serverName: z.string().trim().min(1).max(100),
  updatedAt: z.number().int().min(0).max(4_102_444_800_000),
});

const historyKeySchema = z.object({
  movieSlug: z.string().regex(/^[a-zA-Z0-9-]{1,160}$/),
  episodeSlug: z.string().regex(/^[a-zA-Z0-9_-]{1,160}$/),
  serverName: z.string().trim().min(1).max(100),
});

export const historyRouter = router({
  list: personalProcedure.query(({ ctx }) => listWatchHistory(ctx.user.id)),
  sync: personalProcedure
    .input(z.object({ items: z.array(historyItemSchema).max(80) }))
    .mutation(({ ctx, input }) => syncWatchHistory(ctx.user.id, input.items)),
  remove: personalProcedure
    .input(historyKeySchema)
    .mutation(({ ctx, input }) => removeWatchHistory(ctx.user.id, input)),
});
