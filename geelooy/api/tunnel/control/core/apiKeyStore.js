
// B"H

const crypto = require("crypto");
const { readStore, writeStore } = require("./store.js");

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
    revoked: false
  };

  const store = readStore();
  store.apiKeys = store.apiKeys || {};
  store.apiKeys[keyId] = record;
  writeStore(store);

  return {
    rawKey,
    key: publicKeyView(record)
  };
}

function verifyApiKey(rawKey) {
  const hash = hashKey(rawKey);
  const store = readStore();

  const key = Object.values(store.apiKeys || {})
    .find(k => k.keyHash === hash && !k.revoked);

  if (!key) {
    return { ok: false, error: "invalid_api_key" };
  }

  key.lastUsedAt = Date.now();
  writeStore(store);

  return { ok: true, key };
}

function revokeApiKeyRecord(userId, keyId) {
  const store = readStore();
  const key = store.apiKeys?.[keyId];

  if (!key || key.userId !== userId) {
    return false;
  }

  key.revoked = true;
  key.revokedAt = Date.now();
  writeStore(store);
  return true;
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

  if (!key || key.revoked) {
    return { ok: false, error: "api_key_revoked_or_missing" };
  }

  const usage = store.usage || [];
  const now = Date.now();

  const recent = usage.filter(u =>
    u.keyId === key.keyId &&
    u.at >= minuteStart()
  );

  if (recent.length >= Number(key.rateLimitPerMinute || 60)) {
    return {
      ok: false,
      error: "rate_limited",
      limit: key.rateLimitPerMinute
    };
  }

  const todayBytes = usage
    .filter(u => u.keyId === key.keyId && u.at >= todayStart())
    .reduce((a, b) => a + Number(b.bytes || 0), 0);

  if (todayBytes + byteGuess > Number(key.bytesPerDay || 50000000)) {
    return {
      ok: false,
      error: "daily_byte_limit_exceeded",
      limit: key.bytesPerDay
    };
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
