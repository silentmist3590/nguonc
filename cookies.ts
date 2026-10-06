import { parse as parseCookieHeader } from "cookie";
import type { CookieOptions, Request } from "express";

const PREVIEW_SESSION_COOKIE_NAME = "webdev_app_session";

function isSecureRequest(req: Request) {
  const publicOrigins = [
    process.env.EXPO_PUBLIC_API_BASE_URL,
    process.env.EXPO_WEB_PREVIEW_URL,
    process.env.EXPO_PACKAGER_PROXY_URL,
  ];
  const hasHttpsPublicOrigin = publicOrigins.some((value) => {
    if (!value) return false;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  });
  if (hasHttpsPublicOrigin) return true;
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request,
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure,
  };
}

export function getSessionCookieName(_req: Request): string {
  return PREVIEW_SESSION_COOKIE_NAME;
}

export function currentSessionCookie(req: Request): string | undefined {
  if (!req.headers.cookie) return undefined;
  return parseCookieHeader(req.headers.cookie)[getSessionCookieName(req)];
}
