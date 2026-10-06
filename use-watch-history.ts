import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { GUEST_HISTORY_SCOPE, getWatchProgress, mergeWatchProgress, type WatchProgress } from "@/lib/watch-progress";
import { resolveWatchHistoryIdentity } from "@/lib/watch-history-identity";
import { trpc } from "@/lib/trpc";
import { hasApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

export function useWatchHistory() {
  const apiConfigured = hasApiBaseUrl();
  const auth = trpc.auth.me.useQuery(undefined, { enabled: apiConfigured, retry: false, staleTime: 30_000 });
  const [cachedUser, setCachedUser] = useState<Awaited<ReturnType<typeof Auth.getUserInfo>>>(null);
  const [cachedUserReady, setCachedUserReady] = useState(false);
  const cacheReadVersion = useRef(0);

  const refreshCachedUser = useCallback(async () => {
    const version = ++cacheReadVersion.current;
    setCachedUserReady(false);
    const saved = await Auth.getUserInfo();
    if (version !== cacheReadVersion.current) return;
    const validUser = saved && typeof saved.openId === "string" && saved.openId.trim() ? saved : null;
    setCachedUser(validUser);
    setCachedUserReady(true);
  }, []);

  useEffect(() => {
    void refreshCachedUser();
  }, [refreshCachedUser]);

  useEffect(() => {
    if (!auth.isError) return;
    void refreshCachedUser();
  }, [auth.errorUpdatedAt, auth.isError, refreshCachedUser]);

  useEffect(() => {
    if (!auth.isSuccess) return;
    cacheReadVersion.current += 1;
    const verifiedUser = auth.data?.openId ? auth.data : null;
    setCachedUser(verifiedUser);
    setCachedUserReady(true);
    if (verifiedUser) void Auth.setUserInfo(verifiedUser);
    else void Auth.clearUserInfo();
  }, [auth.data, auth.isSuccess]);

  const identity = resolveWatchHistoryIdentity({
    apiConfigured,
    authStatus: auth.isSuccess ? "success" : auth.isError ? "error" : "pending",
    serverOpenId: auth.data?.openId,
    cachedOpenId: cachedUser?.openId,
    cacheReady: cachedUserReady,
  });
  const { openId, scope, scopeReady, canRecordLocalHistory } = identity;
  const user = auth.data ?? (auth.isError && cachedUserReady ? cachedUser : null);
  const history = trpc.history.list.useQuery(undefined, {
    enabled: apiConfigured && Boolean(openId) && scopeReady,
    staleTime: 30_000,
  });
  const [snapshot, setSnapshot] = useState<{ scope: string; items: WatchProgress[] }>({
    scope: GUEST_HISTORY_SCOPE,
    items: [],
  });

  useFocusEffect(useCallback(() => {
    let active = true;
    void getWatchProgress(scope).then((items) => {
      if (active) setSnapshot({ scope, items });
    });
    return () => { active = false; };
  }, [scope]));

  const refreshLocal = useCallback(async () => {
    const items = await getWatchProgress(scope);
    setSnapshot({ scope, items });
    return items;
  }, [scope]);
  const localItems = snapshot.scope === scope ? snapshot.items : [];
  const items = useMemo(
    () => mergeWatchProgress(localItems, openId ? history.data ?? [] : []),
    [history.data, localItems, openId],
  );

  return {
    user,
    auth,
    scope,
    scopeReady,
    canRecordLocalHistory,
    localItems,
    items,
    history,
    refreshLocal,
  };
}
