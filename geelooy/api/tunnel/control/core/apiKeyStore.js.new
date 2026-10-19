
// B"H

const crypto = require("crypto");
const { readStore, mutateStore } = require("./store.js");

function hashKey(key) {
  return crypto.createHash("sha256").update(String(key)).digest("hex");
}

function makeApiKey() {
  return "ak_" + crypto.randomBytes(36).toString("base64url");
}

function publicKeyView(key) {
  return {
    keyId: key.keyId,
    userId: key.userId,
    name: key.name,
    scopes: key.scopes,
    rateLimitPerMinute: key.rateLimitPerMinute,
    bytesPerDay: key.bytesPerDay,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt || null,
    expiresAt: key.expiresAt || null,
    revoked: !!key.revoked
  };
}

function listApiKeys(userId) {
  const store = readStore();

  return Object.values(store.apiKeys || {})
    .filter(k => k.userId === userId)
    .map(publicKeyView);
}

function createApiKeyRecord(details) {
  const rawKey = makeApiKey();
  const now = Date.now();
  const keyId = "key_" + crypto.randomBytes(10).toString("base64url");

  const record = {
    keyId,
    keyHash: hashKey(rawKey),
    userId: details.userId,
    name: details.name || "Awtsmoos API Key",
    scopes: details.scopes || ["tunnel.read"],
    rateLimitPerMinute: Number(details.rateLimitPerMinute || 60),
    bytesPerDay: Number(details.bytesPerDay || 50000000),
    createdAt: now,
    lastUsedAt: null,
    expiresAt: optionalExpiry(details.expiresAt, now),
    revoked: false
  };

  mutateStore(store => {
    store.apiKeys = store.apiKeys || {};
    store.apiKeys[keyId] = record;
  });

  return {
    rawKey,
    key: publicKeyView(record)
  };
}

function verifyApiKey(rawKey) {
  const hash = hashKey(rawKey);
  const candidate = Object.values(readStore().apiKeys || {})
    .find(entry => entry.keyHash === hash && !entry.revoked && !expired(entry));
  if (!candidate) return { ok: false, error: "invalid_api_key" };

  // Authentication reads a freshly atomically published store. Its success path
  // must not rewrite the entire store for every WebSocket RPC / HTTP request.
  if (Date.now() - Number(candidate.lastUsedAt || 0) < 60000) {
    return { ok: true, key: candidate };
  }
  let key = null;
  mutateStore(store => {
    const current = store.apiKeys?.[candidate.keyId];
    if (!current || current.revoked || expired(current) || current.keyHash !== hash) return;
    current.lastUsedAt = Date.now();
    key = { ...current };
  });
  return key ? { ok: true, key } : { ok: false, error: "invalid_api_key" };
}

function revokeApiKeyRecord(userId, keyId) {
  let revoked = false;
  mutateStore(store => {
    const key = store.apiKeys?.[keyId];
    if (!key || key.userId !== userId) return;
    key.revoked = true;
    key.revokedAt = Date.now();
    revoked = true;
  });
  return revoked;
}

/** Optional expiry is an absolute millisecond timestamp, not an implicit time-to-live. */
function optionalExpiry(value, createdAt) {
  if (value === undefined || value === null || value === "") return null;
  const expiresAt = Number(value);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= createdAt) {
    throw new Error("api_key_expiry_invalid");
  }
  return expiresAt;
}

function expired(key, now = Date.now()) {
  return Number(key?.expiresAt || 0) > 0 && Number(key.expiresAt) <= now;
}

function scopeAllowed(identity, neededScope) {
  if (!neededScope) return true;

  const scopes = identity.scopes || [];

  if (scopes.includes("tunnel.admin")) return true;
  if (scopes.includes(neededScope)) return true;

  return false;
}

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function minuteStart() {
  return Date.now() - 60 * 1000;
}

function enforceApiKeyRate(identity, byteGuess = 0) {
  if (identity.kind !== "apiKey") {
    return { ok: true };
  }

  const store = readStore();
  const key = store.apiKeys?.[identity.keyId];

  if (!key || key.revoked || expired(key)) {
    return { ok: false, error: "api_key_revoked_or_missing" };
  }

  // Optimized 2026-10-19: newest-first iteration with early break.
  const usageEvents = Array.isArray(store.usageEvents) ? store.usageEvents : [];
  const legacyUsage = Array.isArray(store.usage) ? store.usage : [];
  const minAt = minuteStart();
  const dayAt = todayStart();
  const rateLimit = Number(key.rateLimitPerMinute || 60);
  const byteLimit = Number(key.bytesPerDay || 50000000);
  let recentCount = 0;
  let todayBytes = 0;
  function scanUsage(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const u = arr[i];
      if (u.at < dayAt) break;
      if (u.keyId !== key.keyId) continue;
      if (u.at >= minAt && ++recentCount >= rateLimit) return "limited";
      todayBytes += Number(u.bytes || 0);
    }
    return null;
  }
  if (scanUsage(usageEvents) === "limited" || scanUsage(legacyUsage) === "limited") {
    return { ok: false, error: "rate_limited", limit: key.rateLimitPerMinute };
  }
  if (todayBytes + byteGuess > byteLimit) {
    return { ok: false, error: "daily_byte_limit_exceeded", limit: key.bytesPerDay };
  }
return { ok: true };
}

module.exports = {
  listApiKeys,
  createApiKeyRecord,
  verifyApiKey,
  revokeApiKeyRecord,
  publicKeyView,
  scopeAllowed,
  enforceApiKeyRate
};
