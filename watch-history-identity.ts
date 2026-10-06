export const GUEST_HISTORY_SCOPE = "guest";

export function historyScopeForUser(openId: string | null | undefined): string {
  return openId ? `account:${openId}` : GUEST_HISTORY_SCOPE;
}

export type WatchHistoryAuthStatus = "pending" | "success" | "error";

export function resolveWatchHistoryIdentity(input: {
  apiConfigured: boolean;
  authStatus: WatchHistoryAuthStatus;
  serverOpenId?: string | null;
  cachedOpenId?: string | null;
  cacheReady: boolean;
}) {
  const openId = input.authStatus === "success"
    ? input.serverOpenId || null
    : input.authStatus === "error" && input.cacheReady
      ? input.cachedOpenId || null
      : null;
  const scopeReady = !input.apiConfigured
    || input.authStatus === "success"
    || (input.authStatus === "error" && input.cacheReady);
  const canRecordLocalHistory = input.apiConfigured && (
    input.authStatus === "success"
    || (input.authStatus === "error" && input.cacheReady && Boolean(openId))
  );
  return {
    openId,
    scope: historyScopeForUser(openId),
    scopeReady,
    canRecordLocalHistory,
  };
}
