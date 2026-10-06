import * as Crypto from "expo-crypto";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as ReactNative from "react-native";
import { decodeOAuthState, encodeOAuthState } from "@/shared/oauth-state";

const bundleId = "space.manus.phimviet.t042812733911590";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;
const PENDING_OAUTH_NONCE_KEY = "phimviet.oauth.pending-nonce.v1";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
const env = {
  portal: extra.oauthPortalUrl ?? process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "",
  server: extra.oauthServerUrl ?? process.env.EXPO_PUBLIC_OAUTH_SERVER_URL ?? "",
  appId: extra.appId ?? process.env.EXPO_PUBLIC_APP_ID ?? "",
  ownerId: process.env.EXPO_PUBLIC_OWNER_OPEN_ID ?? "",
  ownerName: process.env.EXPO_PUBLIC_OWNER_NAME ?? "",
  apiBaseUrl: extra.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  deepLinkScheme: schemeFromBundleId,
};

export const OAUTH_PORTAL_URL = env.portal;
export const OAUTH_SERVER_URL = env.server;
export const APP_ID = env.appId;
export const OWNER_OPEN_ID = env.ownerId;
export const OWNER_NAME = env.ownerName;
export const API_BASE_URL = env.apiBaseUrl;

export function getApiBaseUrl(): string {
  if (API_BASE_URL) return API_BASE_URL.replace(/\/$/, "");
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) return `${protocol}//${apiHostname}`;
  }
  return "";
}

export function hasApiBaseUrl(): boolean {
  return Boolean(getApiBaseUrl());
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";

export const getRedirectUri = () => {
  if (ReactNative.Platform.OS === "web") {
    return `${getApiBaseUrl()}/api/oauth/callback`;
  }
  return Linking.createURL("/oauth/callback", { scheme: env.deepLinkScheme });
};

function makeNonce(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function getLoginUrl(nonce: string): string {
  if (!OAUTH_PORTAL_URL || !APP_ID) throw new Error("Manus login configuration is unavailable");
  const redirectUri = getRedirectUri();
  const state = encodeOAuthState({ redirectUri, nonce });
  const url = new URL(`${OAUTH_PORTAL_URL.replace(/\/+$/, "")}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("responseType", "code");
  url.searchParams.set("type", "signIn");
  return url.toString();
}

export async function startOAuthLogin(): Promise<string | null> {
  if (!OAUTH_PORTAL_URL || !APP_ID) throw new Error("Manus login configuration is unavailable");
  if (ReactNative.Platform.OS === "web") {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) throw new Error("OAuth server address is unavailable");
    window.location.assign(`${apiBaseUrl}/api/oauth/start`);
    return null;
  }

  const nonce = makeNonce(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(PENDING_OAUTH_NONCE_KEY, nonce);
  try {
    await Linking.openURL(getLoginUrl(nonce));
  } catch {
    await SecureStore.deleteItemAsync(PENDING_OAUTH_NONCE_KEY);
    throw new Error("Không mở được trang đăng nhập Manus. Hãy thử lại.");
  }
  return null;
}

export async function consumeMobileOAuthState(stateValue: string): Promise<boolean> {
  const parsed = decodeOAuthState(stateValue);
  const expectedRedirectUri = getRedirectUri();
  let storedNonce: string | null = null;
  try {
    storedNonce = await SecureStore.getItemAsync(PENDING_OAUTH_NONCE_KEY);
    await SecureStore.deleteItemAsync(PENDING_OAUTH_NONCE_KEY);
  } catch {
    return false;
  }
  return Boolean(
    parsed &&
      storedNonce &&
      parsed.nonce === storedNonce &&
      parsed.redirectUri === expectedRedirectUri,
  );
}
