import { describe, expect, it } from "vitest";
import { GUEST_HISTORY_SCOPE, resolveWatchHistoryIdentity } from "../lib/watch-history-identity";

function resolve(overrides: Partial<Parameters<typeof resolveWatchHistoryIdentity>[0]>) {
  return resolveWatchHistoryIdentity({
    apiConfigured: true,
    authStatus: "pending",
    cacheReady: false,
    ...overrides,
  });
}

describe("watch history identity resolution", () => {
  it("does not reuse a previous account while authentication is pending", () => {
    expect(resolve({ cachedOpenId: "user-1", cacheReady: true })).toEqual({
      openId: null,
      scope: GUEST_HISTORY_SCOPE,
      scopeReady: false,
      canRecordLocalHistory: false,
    });
  });

  it("keeps history under the cached account after auth fails and cache is ready", () => {
    expect(resolve({ authStatus: "error", cachedOpenId: "user-1", cacheReady: true })).toEqual({
      openId: "user-1",
      scope: "account:user-1",
      scopeReady: true,
      canRecordLocalHistory: true,
    });
  });

  it("does not write to guest history when auth fails without a cached identity", () => {
    expect(resolve({ authStatus: "error", cacheReady: true })).toEqual({
      openId: null,
      scope: GUEST_HISTORY_SCOPE,
      scopeReady: true,
      canRecordLocalHistory: false,
    });
  });

  it("uses the server identity on success and allows a verified guest scope", () => {
    expect(resolve({ authStatus: "success", serverOpenId: "user-2" })).toMatchObject({
      openId: "user-2",
      scope: "account:user-2",
      scopeReady: true,
      canRecordLocalHistory: true,
    });
    expect(resolve({ authStatus: "success", serverOpenId: null })).toMatchObject({
      openId: null,
      scope: GUEST_HISTORY_SCOPE,
      scopeReady: true,
      canRecordLocalHistory: true,
    });
  });

  it("preserves the cached account partition but denies writes without API configuration", () => {
    expect(resolve({ apiConfigured: false, cachedOpenId: "user-1", authStatus: "error", cacheReady: true })).toEqual({
      openId: "user-1",
      scope: "account:user-1",
      scopeReady: true,
      canRecordLocalHistory: false,
    });
  });
});
