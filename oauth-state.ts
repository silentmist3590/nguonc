export type OAuthStatePayload = {
  redirectUri: string;
  nonce: string;
};

const NONCE_PATTERN = /^[a-f0-9]{64}$/i;

function encodeBase64(value: string): string {
  if (!/^[\x00-\x7F]*$/.test(value)) {
    throw new Error("OAuth state must be ASCII");
  }
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  const BufferImpl = (globalThis as unknown as {
    Buffer?: { from(input: string, encoding: string): { toString(encoding: string): string } };
  }).Buffer;
  if (BufferImpl) return BufferImpl.from(value, "utf8").toString("base64");
  throw new Error("Base64 encoder is unavailable");
}

function decodeBase64(value: string): string | null {
  try {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
    if (typeof globalThis.atob === "function") return globalThis.atob(value);
    const BufferImpl = (globalThis as unknown as {
      Buffer?: { from(input: string, encoding: string): { toString(encoding: string): string } };
    }).Buffer;
    return BufferImpl ? BufferImpl.from(value, "base64").toString("utf8") : null;
  } catch {
    return null;
  }
}

export function encodeOAuthState(payload: OAuthStatePayload): string {
  if (!payload.redirectUri || payload.redirectUri.length > 2048 || !NONCE_PATTERN.test(payload.nonce)) {
    throw new Error("Invalid OAuth state payload");
  }
  return encodeBase64(JSON.stringify(payload));
}

export function decodeOAuthState(value: string): OAuthStatePayload | null {
  if (!value || value.length > 8192) return null;
  const decoded = decodeBase64(value);
  if (!decoded) return null;
  try {
    const parsed = JSON.parse(decoded) as Partial<OAuthStatePayload>;
    if (
      typeof parsed.redirectUri !== "string" ||
      parsed.redirectUri.length === 0 ||
      parsed.redirectUri.length > 2048 ||
      typeof parsed.nonce !== "string" ||
      !NONCE_PATTERN.test(parsed.nonce)
    ) {
      return null;
    }
    return { redirectUri: parsed.redirectUri, nonce: parsed.nonce };
  } catch {
    return null;
  }
}
