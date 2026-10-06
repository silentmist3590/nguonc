import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { TvFocusablePressable } from "@/components/tv-focusable";
import { consumeMobileOAuthState } from "@/constants/oauth";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useMovieTheme } from "@/lib/theme-provider";

function routeString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function OAuthCallback() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    code?: string | string[];
    state?: string | string[];
    error?: string | string[];
  }>();
  const { colors: C } = useMovieTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const handleCallback = async () => {
      try {
        // Web OAuth is completed by the server callback and returns to the app origin.
        if (Platform.OS === "web") {
          router.replace("/(tabs)/account");
          return;
        }

        let code = routeString(params.code);
        let state = routeString(params.state);
        let oauthError = routeString(params.error);
        if (!code || !state) {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl) {
            const query = new URL(initialUrl).searchParams;
            code ||= query.get("code") ?? "";
            state ||= query.get("state") ?? "";
            oauthError ||= query.get("error") ?? "";
          }
        }

        if (!(await consumeMobileOAuthState(state))) {
          throw new Error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Hãy bắt đầu đăng nhập lại.");
        }
        if (oauthError) {
          throw new Error("Đăng nhập đã bị hủy hoặc không hoàn tất.");
        }
        if (!code || !state) {
          throw new Error("Thiếu mã xác thực. Hãy bắt đầu đăng nhập lại.");
        }

        const result = await Api.exchangeOAuthCode(code, state);
        if (!result.sessionToken || typeof result.user?.openId !== "string") {
          throw new Error("Không nhận được phiên đăng nhập hợp lệ từ Manus.");
        }

        await Auth.setSessionToken(result.sessionToken);
        await Auth.setUserInfo({
          id: typeof result.user.id === "number" ? result.user.id : 0,
          openId: result.user.openId,
          name: typeof result.user.name === "string" ? result.user.name : null,
          email: typeof result.user.email === "string" ? result.user.email : null,
          loginMethod: typeof result.user.loginMethod === "string" ? result.user.loginMethod : null,
          lastSignedIn: new Date(result.user.lastSignedIn || Date.now()),
        });
        queryClient.clear();
        setStatus("success");
        timeout = setTimeout(() => router.replace("/(tabs)/account"), 650);
      } catch (cause) {
        setStatus("error");
        setErrorMessage(cause instanceof Error ? cause.message : "Không hoàn tất được đăng nhập.");
      }
    };

    void handleCallback();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [params.code, params.error, params.state, queryClient, router]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.content}>
        {status === "processing" ? (
          <>
            <ActivityIndicator size="large" color={C.amber} />
            <Text style={styles.title}>Đang hoàn tất đăng nhập…</Text>
          </>
        ) : status === "success" ? (
          <>
            <MaterialCommunityIcons name="check-circle-outline" size={46} color={C.amber} />
            <Text style={styles.title}>Đăng nhập thành công</Text>
            <Text style={styles.body}>Đang chuyển về tài khoản của bạn.</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color={C.wine} />
            <Text style={styles.title}>Chưa đăng nhập được</Text>
            <Text style={styles.body}>{errorMessage}</Text>
            <TvFocusablePressable style={styles.button} onPress={() => router.replace("/(tabs)/account")} accessibilityRole="button">
              <Text style={styles.buttonText}>Quay lại Tài khoản</Text>
            </TvFocusablePressable>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

function createStyles(C: ReturnType<typeof useMovieTheme>["colors"]) {
  return StyleSheet.create({
    content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 14 },
    title: { color: C.text, fontSize: 19, fontWeight: "900", textAlign: "center" },
    body: { color: C.muted, fontSize: 13, lineHeight: 20, textAlign: "center", maxWidth: 460 },
    button: { minHeight: 48, paddingHorizontal: 19, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: C.amber, marginTop: 8 },
    buttonText: { color: C.accentText, fontSize: 13, fontWeight: "900" },
  });
}
