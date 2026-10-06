import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "@/components/screen-container";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { APP_ID, hasApiBaseUrl, OAUTH_PORTAL_URL, startOAuthLogin } from "@/constants/oauth";
import { useMovieTheme } from "@/lib/theme-provider";
import * as Auth from "@/lib/_core/auth";
import { GUEST_HISTORY_SCOPE, getWatchProgress, historyScopeForUser, mergeWatchProgress, replaceWatchProgress } from "@/lib/watch-progress";
import type { WatchProgress } from "@/lib/watch-progress";
import { trpc } from "@/lib/trpc";

export default function AccountScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000 || Boolean((Platform as typeof Platform & { isTV?: boolean }).isTV);
  const { colors: C, colorScheme, setColorScheme } = useMovieTheme();
  const styles = useMemo(() => createStyles(C, isWide), [C, isWide]);
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();
  const apiConfigured = hasApiBaseUrl();
  const me = trpc.auth.me.useQuery(undefined, { enabled: apiConfigured, retry: false, staleTime: 0 });
  const history = trpc.history.list.useQuery(undefined, { enabled: Boolean(me.data?.openId), staleTime: 20_000 });
  const syncMutation = trpc.history.sync.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const [localItems, setLocalItems] = useState<WatchProgress[]>([]);
  const [guestItems, setGuestItems] = useState<WatchProgress[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [cachedUser, setCachedUser] = useState<Awaited<ReturnType<typeof Auth.getUserInfo>>>(null);
  const [cachedUserReady, setCachedUserReady] = useState(false);
  const user = me.data ?? (me.isError && cachedUserReady ? cachedUser : null);
  const offlineCachedUser = Boolean(user?.openId) && me.isError;
  const userScope = historyScopeForUser(user?.openId);
  const loginConfigured = apiConfigured && Boolean(OAUTH_PORTAL_URL && APP_ID);

  useFocusEffect(useCallback(() => {
    let active = true;
    if (me.isError) {
      void Auth.getUserInfo().then((saved) => {
        if (!active) return;
        const validUser = saved && typeof saved.openId === "string" && saved.openId.trim() ? saved : null;
        setCachedUser(validUser);
        setCachedUserReady(true);
      });
    }
    Promise.all([
      getWatchProgress(userScope),
      user?.openId ? getWatchProgress(GUEST_HISTORY_SCOPE) : Promise.resolve([]),
    ]).then(([saved, guests]) => {
      if (!active) return;
      setLocalItems(saved);
      setGuestItems(guests);
    });
    return () => { active = false; };
  }, [userScope, user?.openId, me.isError]));

  useEffect(() => {
    if (!me.isSuccess) return;
    let active = true;
    const verifiedUser = me.data?.openId ? me.data : null;
    void (async () => {
      if (verifiedUser) await Auth.setUserInfo(verifiedUser);
      else await Auth.clearUserInfo();
      if (!active) return;
      setCachedUser(verifiedUser);
      setCachedUserReady(true);
    })();
    return () => { active = false; };
  }, [me.data, me.isSuccess]);

  const handleLogin = async () => {
    setError("");
    setStatus("");
    setLoginPending(true);
    try {
      await startOAuthLogin();
      setLoginPending(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không mở được trang đăng nhập.");
      setLoginPending(false);
    }
  };

  const handleSync = async () => {
    if (!me.data?.openId || me.isError) return;
    setError("");
    setStatus("");
    try {
      const [accountLocal, guestLocal] = await Promise.all([
        getWatchProgress(userScope),
        getWatchProgress(GUEST_HISTORY_SCOPE),
      ]);
      const syncItems = mergeWatchProgress(accountLocal, guestLocal);
      const synced = await syncMutation.mutateAsync({ items: syncItems });
      await replaceWatchProgress(synced, userScope);

      // Remove only the guest entries included in this successful sync. Newer records remain queued.
      const guestNow = await getWatchProgress(GUEST_HISTORY_SCOPE);
      const syncedKeys = new Map(
        syncItems.map((item) => [
          `${item.movieSlug}\u0000${item.episodeSlug}\u0000${item.serverName}`,
          item.updatedAt,
        ]),
      );
      const remainingGuest = guestNow.filter((item) => {
        const key = `${item.movieSlug}\u0000${item.episodeSlug}\u0000${item.serverName}`;
        return !syncedKeys.has(key) || item.updatedAt > (syncedKeys.get(key) ?? 0);
      });
      await replaceWatchProgress(remainingGuest, GUEST_HISTORY_SCOPE);
      setLocalItems(synced);
      setGuestItems(remainingGuest);
      await utils.history.list.invalidate();
      setStatus(guestLocal.length > 0 ? `Đã gộp ${guestLocal.length} mục và đồng bộ ${synced.length} mục.` : `Đã đồng bộ ${synced.length} mục lịch sử.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Đồng bộ chưa thành công. Lịch sử cục bộ vẫn được giữ.");
    }
  };

  const handleLogout = async () => {
    setError("");
    setStatus("");
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Clear local credentials even when the network is unavailable.
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      setCachedUser(null);
      setCachedUserReady(true);
      queryClient.clear();
      setLocalItems([]);
      setGuestItems([]);
      setStatus("Đã đăng xuất. Lịch sử riêng trên thiết bị vẫn được giữ theo tài khoản.");
    }
  };

  const displayName = user?.name?.trim() || user?.email || "Tài khoản Manus";
  const initial = displayName.slice(0, 1).toLocaleUpperCase("vi-VN");
  const accountHistory = mergeWatchProgress(localItems, history.data ?? []);
  const lastSyncDate = accountHistory[0]?.updatedAt
    ? new Date(accountHistory[0].updatedAt).toLocaleDateString("vi-VN")
    : "Chưa đồng bộ";

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>HỒ SƠ CÁ NHÂN</Text>
        <Text style={styles.title}>Tài khoản</Text>

        <View style={styles.profileCard}>
          {apiConfigured && me.isLoading ? (
            <View style={styles.loading}><ActivityIndicator color={C.amber} /><Text style={styles.body}>Đang kiểm tra phiên đăng nhập…</Text></View>
          ) : user ? (
            <>
              <View style={styles.profileRow}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
                <View style={styles.profileCopy}>
                  <Text numberOfLines={1} style={styles.name}>{displayName}</Text>
                  {!!user.email && <Text numberOfLines={1} style={styles.email}>{user.email}</Text>}
                  <View style={styles.signedIn}><View style={[styles.onlineDot, offlineCachedUser && styles.offlineDot]} /><Text style={styles.signedInText}>{offlineCachedUser ? "Tài khoản đã lưu · đang ngoại tuyến" : "Đã đăng nhập bằng Manus"}</Text></View>
                </View>
                <MaterialCommunityIcons name="shield-check-outline" size={23} color={C.amber} />
              </View>
              <View style={styles.divider} />
              {offlineCachedUser ? (
                <View style={styles.privacyNotice}>
                  <MaterialCommunityIcons name="cloud-off-outline" size={19} color={C.amber} />
                  <Text style={styles.privacyText}>Không thể xác minh phiên lúc này. Lịch sử theo tài khoản vẫn được giữ trên thiết bị; kết nối lại để xem dữ liệu máy chủ hoặc đồng bộ.</Text>
                </View>
              ) : null}
              <View style={styles.historySummary}>
                <View><Text style={styles.statValue}>{accountHistory.length}</Text><Text style={styles.statLabel}>mục trên tài khoản</Text></View>
                <View style={styles.statDivider} />
                <View><Text style={styles.statValue}>{guestItems.length}</Text><Text style={styles.statLabel}>mục chỉ trên thiết bị</Text></View>
                <View style={styles.statDivider} />
                <View><Text style={styles.statDate}>{lastSyncDate}</Text><Text style={styles.statLabel}>hoạt động gần nhất</Text></View>
              </View>
              {guestItems.length > 0 ? (
                <View style={styles.privacyNotice}>
                  <MaterialCommunityIcons name="cloud-upload-outline" size={19} color={C.amber} />
                  <Text style={styles.privacyText}>Bạn có {guestItems.length} mục khách trên thiết bị. Chỉ khi chọn nút dưới đây, các mục này mới được thêm vào tài khoản Manus đang đăng nhập.</Text>
                </View>
              ) : null}
              <TvFocusablePressable
                style={({ pressed }) => [styles.primaryButton, (pressed || syncMutation.isPending) && styles.pressed]}
                onPress={() => { void handleSync(); }}
                disabled={syncMutation.isPending || history.isLoading || offlineCachedUser}
                accessibilityRole="button"
                accessibilityLabel="Đồng bộ lịch sử với tài khoản"
              >
                {syncMutation.isPending ? <ActivityIndicator size="small" color={C.accentText} /> : <MaterialCommunityIcons name="sync" size={18} color={C.accentText} />}
                <Text style={styles.primaryText}>{offlineCachedUser ? "Chờ kết nối để đồng bộ" : guestItems.length ? "Gộp lịch sử thiết bị & đồng bộ" : "Đồng bộ lịch sử"}</Text>
              </TvFocusablePressable>
              <TvFocusablePressable style={styles.logoutButton} onPress={() => { void handleLogout(); }} disabled={logoutMutation.isPending} accessibilityRole="button">
                <MaterialCommunityIcons name="logout" size={17} color={C.muted} /><Text style={styles.logoutText}>Đăng xuất</Text>
              </TvFocusablePressable>
            </>
          ) : (
            <>
              <View style={styles.signinIcon}><MaterialCommunityIcons name="account-lock-outline" size={30} color={C.amber} /></View>
              <Text style={styles.signinTitle}>Lịch sử của bạn, theo bạn</Text>
              <Text style={styles.body}>Đăng nhập Manus để đồng bộ những tập đã mở giữa các thiết bị. Mật khẩu không được lưu trong ứng dụng.</Text>
              <TvFocusablePressable
                style={({ pressed }) => [styles.primaryButton, (pressed || loginPending || !loginConfigured) && styles.pressed]}
                onPress={() => { void handleLogin(); }}
                disabled={loginPending || !loginConfigured}
                accessibilityRole="button"
                accessibilityLabel="Đăng nhập bằng Manus"
              >
                {loginPending ? <ActivityIndicator size="small" color={C.accentText} /> : <MaterialCommunityIcons name="login" size={18} color={C.accentText} />}
                <Text style={styles.primaryText}>{loginPending ? "Đang mở đăng nhập…" : "Đăng nhập bằng Manus"}</Text>
              </TvFocusablePressable>
              {!loginConfigured && <Text style={styles.warning}>OAuth/API chưa được cấu hình cho phiên bản này.</Text>}
              {me.isError && <Text style={styles.warning}>Không kiểm tra được phiên; hãy thử lại khi có kết nối.</Text>}
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.themeIcon}><MaterialCommunityIcons name={colorScheme === "dark" ? "weather-night" : "white-balance-sunny"} size={20} color={C.amber} /></View>
            <View style={styles.sectionCopy}><Text style={styles.sectionTitle}>Giao diện</Text><Text style={styles.body}>Chọn chế độ sáng hoặc tối; lựa chọn được lưu trên thiết bị.</Text></View>
          </View>
          <View style={styles.themeChoices}>
            <TvFocusablePressable
              style={({ pressed }) => [styles.themeChoice, colorScheme === "dark" && styles.themeChoiceSelected, pressed && styles.pressed]}
              onPress={() => setColorScheme("dark")}
              accessibilityRole="button"
              accessibilityLabel="Bật giao diện tối"
              accessibilityState={{ selected: colorScheme === "dark" }}
            >
              <MaterialCommunityIcons name="weather-night" size={18} color={colorScheme === "dark" ? C.amber : C.muted} /><Text style={styles.themeChoiceText}>Tối</Text>
            </TvFocusablePressable>
            <TvFocusablePressable
              style={({ pressed }) => [styles.themeChoice, colorScheme === "light" && styles.themeChoiceSelected, pressed && styles.pressed]}
              onPress={() => setColorScheme("light")}
              accessibilityRole="button"
              accessibilityLabel="Bật giao diện sáng"
              accessibilityState={{ selected: colorScheme === "light" }}
            >
              <MaterialCommunityIcons name="white-balance-sunny" size={18} color={colorScheme === "light" ? C.amber : C.muted} /><Text style={styles.themeChoiceText}>Sáng</Text>
            </TvFocusablePressable>
          </View>
        </View>

        {status ? <View style={styles.status}><MaterialCommunityIcons name="check-circle-outline" size={16} color={C.amber} /><Text style={styles.statusText}>{status}</Text></View> : null}
        {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle-outline" size={16} color={C.wine} /><Text style={styles.errorText}>{error}</Text></View> : null}
        <Text style={styles.footer}>Phim Việt · Lịch sử đồng bộ chỉ gắn với tài khoản Manus đang hoạt động.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(C: ReturnType<typeof useMovieTheme>["colors"], isWide: boolean) {
  return StyleSheet.create({
    content: { width: "100%", maxWidth: isWide ? 1120 : undefined, alignSelf: "center", paddingHorizontal: isWide ? 44 : 20, paddingTop: 20, paddingBottom: 30 },
    kicker: { color: C.amber, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
    title: { color: C.text, fontSize: isWide ? 38 : 27, fontWeight: "900", marginTop: 5, marginBottom: 18 },
    profileCard: { padding: isWide ? 28 : 17, borderRadius: 20, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
    loading: { minHeight: 140, alignItems: "center", justifyContent: "center", gap: 10 },
    profileRow: { flexDirection: "row", alignItems: "center", gap: 13 },
    avatar: { width: isWide ? 72 : 55, height: isWide ? 72 : 55, borderRadius: isWide ? 25 : 19, backgroundColor: C.amberSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.amber },
    avatarText: { color: C.amber, fontSize: isWide ? 30 : 22, fontWeight: "900" },
    profileCopy: { flex: 1 },
    name: { color: C.text, fontSize: isWide ? 22 : 16, fontWeight: "900" },
    email: { color: C.muted, fontSize: isWide ? 14 : 11, marginTop: 3 },
    signedIn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7 },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#3AAE6B" },
    offlineDot: { backgroundColor: C.amber },
    signedInText: { color: C.muted, fontSize: 10, fontWeight: "700" },
    divider: { height: 1, backgroundColor: C.line, marginVertical: 19 },
    historySummary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    statValue: { color: C.text, fontSize: isWide ? 24 : 18, fontWeight: "900" },
    statDate: { color: C.text, fontSize: isWide ? 15 : 11, fontWeight: "800" },
    statLabel: { color: C.muted, fontSize: isWide ? 11 : 8, marginTop: 3 },
    statDivider: { width: 1, height: 35, backgroundColor: C.line },
    privacyNotice: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 11, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: C.amberSoft, backgroundColor: C.surfaceRaised },
    privacyText: { flex: 1, color: C.text, fontSize: 10, lineHeight: 16 },
    primaryButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 15, marginTop: 18, borderRadius: 12, backgroundColor: C.amber, borderWidth: 1, borderColor: C.amber },
    primaryText: { color: C.accentText, fontSize: 11, fontWeight: "900" },
    logoutButton: { minHeight: 44, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, marginTop: 8, borderRadius: 11, borderWidth: 1, borderColor: C.line },
    logoutText: { color: C.muted, fontSize: 10, fontWeight: "800" },
    signinIcon: { width: 64, height: 64, alignSelf: "center", borderRadius: 22, borderWidth: 1, borderColor: C.amberSoft, backgroundColor: C.surfaceRaised, alignItems: "center", justifyContent: "center", marginBottom: 11 },
    signinTitle: { color: C.text, fontSize: isWide ? 24 : 17, fontWeight: "900", textAlign: "center" },
    body: { color: C.muted, fontSize: isWide ? 14 : 11, lineHeight: isWide ? 21 : 17, textAlign: "center", marginTop: 6 },
    warning: { color: C.wine, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 9 },
    sectionCard: { marginTop: 16, padding: isWide ? 23 : 16, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
    sectionHeading: { flexDirection: "row", alignItems: "center", gap: 11 },
    themeIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceRaised },
    sectionCopy: { flex: 1 },
    sectionTitle: { color: C.text, fontSize: 14, fontWeight: "900" },
    themeChoices: { flexDirection: "row", gap: 9, marginTop: 15 },
    themeChoice: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.surfaceRaised },
    themeChoiceSelected: { borderColor: C.amber, backgroundColor: C.amberSoft },
    themeChoiceText: { color: C.text, fontSize: 11, fontWeight: "800" },
    pressed: { opacity: 0.78 },
    status: { flexDirection: "row", alignItems: "flex-start", gap: 7, padding: 11, marginTop: 13, borderRadius: 12, backgroundColor: C.surfaceRaised },
    statusText: { flex: 1, color: C.text, fontSize: 10, lineHeight: 15 },
    error: { flexDirection: "row", alignItems: "flex-start", gap: 7, padding: 11, marginTop: 13, borderRadius: 12, backgroundColor: C.surfaceRaised },
    errorText: { flex: 1, color: C.wine, fontSize: 10, lineHeight: 15 },
    footer: { color: C.muted, fontSize: 9, lineHeight: 14, textAlign: "center", marginTop: 18 },
  });
}
