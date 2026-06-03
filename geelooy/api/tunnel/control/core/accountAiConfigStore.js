// B"H
const { readStore, writeStore } = require("./store.js");

/**
 * B"H
 * Chapter 1: The key was a coal in a closed fist.
 *
 * The Awtsmoos gives the user two vessels: a local well on their own machine,
 * and an account well in the hosted database. This module never saves a
 * provider key remotely unless the caller explicitly opts in. When it does, the
 * key is kept under the authenticated user id so the Virtual OS can drink from
 * the same provider without touching the user's local disk.
 */
const REMOTE_WARNING = [
  "Provider key saved to your Awtsmoos account.",
  "It can be used by hosted Virtual OS AI actions without your local tunnel.",
  "Only choose this for keys you are comfortable storing remotely."
].join(" ");

function clean(value = "") {
  return String(value || "").trim().toLowerCase();
}

function shouldSaveRemote(payload = {}) {
  const merged = actionPayload(payload);
  return bool(merged.saveToAccount) || bool(merged.saveProviderKeyToAccount) ||
    bool(merged.remoteSaveAccount) || bool(merged.storeProviderKeyRemotely);
}

function actionPayload(payload = {}) {
  const parsed = parsePayloadJson(payload);
  return { ...payload, ...parsed };
}

function parsePayloadJson(payload = {}) {
  for (const field of [payload.params, payload.content, payload.text, payload.body, payload.query, payload.goal]) {
    const parsed = parseOne(field);
    if (Object.keys(parsed).length) return parsed;
  }
  return {};
}

function parseOne(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  const text = String(value || "").trim();
  if (!text) return {};
  if (text.startsWith("base64json:")) return parseOne(Buffer.from(text.slice(11), "base64").toString("utf8"));
  if (!text.startsWith("{")) return {};
  try {
    const json = JSON.parse(text);
    return json && typeof json === "object" ? json : {};
  } catch (_e) {
    return {};
  }
}

function bool(value) {
  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
}

function userBucket(store, userId) {
  store.accountAiConfigs = store.accountAiConfigs || {};
  store.accountAiConfigs[userId] = store.accountAiConfigs[userId] || { providerKeys: {}, updatedAt: "" };
  store.accountAiConfigs[userId].providerKeys = store.accountAiConfigs[userId].providerKeys || {};
  return store.accountAiConfigs[userId];
}

function saveAccountProviderKey(userId, payload = {}) {
  const merged = actionPayload(payload);
  const provider = clean(merged.provider || merged.providerId);
  const apiKey = String(merged.apiKey || "").trim();
  if (!userId) return failure("missing_user_id", provider);
  if (!provider) return failure("missing_provider", provider);
  if (!apiKey) return failure("missing_api_key", provider);

  const store = readStore();
  const bucket = userBucket(store, userId);
  bucket.providerKeys[provider] = apiKey;
  bucket.updatedAt = new Date().toISOString();
  writeStore(store);
  return saved(provider, apiKey, bucket.updatedAt);
}

function removeAccountProviderKey(userId, payload = {}) {
  const merged = actionPayload(payload);
  const provider = clean(merged.provider || merged.providerId);
  if (!userId) return failure("missing_user_id", provider);
  if (!provider) return failure("missing_provider", provider);
  const store = readStore();
  const bucket = userBucket(store, userId);
  delete bucket.providerKeys[provider];
  bucket.updatedAt = new Date().toISOString();
  writeStore(store);
  return { ok: true, provider, removedFromAccount: true, updatedAt: bucket.updatedAt };
}

function accountProviderKeys(userId) {
  if (!userId) return {};
  const store = readStore();
  return { ...(store.accountAiConfigs?.[userId]?.providerKeys || {}) };
}

function accountProviderSummaries(userId) {
  return Object.entries(accountProviderKeys(userId)).map(([provider, key]) => ({
    provider,
    hasKey: Boolean(key),
    keyMask: maskKey(key),
    keySource: "awtsmoosAccount"
  }));
}

function mergeAccountKeys(config = {}, userId) {
  const remote = accountProviderKeys(userId);
  return {
    ...config,
    aiAgents: {
      ...(config.aiAgents || {}),
      providerKeys: { ...(config.aiAgents?.providerKeys || {}), ...remote }
    }
  };
}

function saved(provider, apiKey, updatedAt) {
  return { ok: true, provider, savedToAccount: true, keyMask: maskKey(apiKey), keySource: "awtsmoosAccount", warning: REMOTE_WARNING, updatedAt };
}

function failure(error, provider) {
  return { ok: false, provider, savedToAccount: false, error };
}

function maskKey(key = "") {
  const text = String(key || "");
  return text ? text.slice(0, 6) + "..." + text.slice(-4) : "";
}

module.exports = {
  REMOTE_WARNING,
  actionPayload,
  accountProviderSummaries,
  mergeAccountKeys,
  removeAccountProviderKey,
  saveAccountProviderKey,
  shouldSaveRemote
};
