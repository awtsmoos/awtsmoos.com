// B"H
const crypto = require("crypto");
const { readStore, writeStore } = require("../core/store.js");
const { DEFAULT_SETTINGS, aiPolicyCheck, deniesSecretPath, mergedSettings, normalizePreview } = require("./previewPolicy.js");

function id(prefix = "view") {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

function now() { return Date.now(); }
function baseUrl() { return "https://awtsmoos.com"; }

/**
 * B"H
 * Chapter: The view link became a first-class tunnel artifact.
 */
function ensure(store, userId) {
  store.previewGateway = store.previewGateway || { users: {} };
  const users = store.previewGateway.users;
  users[userId] = users[userId] || { settings: { ...DEFAULT_SETTINGS }, previews: {} };
  users[userId].settings = mergedSettings(users[userId].settings);
  users[userId].previews = users[userId].previews || {};
  return users[userId];
}

function settingsGet(userId) {
  const store = readStore();
  return ensure(store, userId).settings;
}

function settingsSet(userId, patch = {}) {
  const store = readStore();
  const bucket = ensure(store, userId);
  bucket.settings = mergedSettings({ ...bucket.settings, ...patch });
  writeStore(store);
  return bucket.settings;
}

function createPreview(userId, input = {}) {
  const store = readStore();
  const bucket = ensure(store, userId);
  const policy = aiPolicyCheck(input, bucket.settings);
  if (!policy.ok) return policy;
  const normalized = normalizePreview(input, bucket.settings);
  const sourcePath = normalized.path || normalized.source?.path || "";
  if (["file", "folder"].includes(normalized.kind) && deniesSecretPath(sourcePath, bucket.settings)) return { ok: false, error: "preview_secret_path_denied", path: sourcePath };
  const previewId = id("view");
  const at = now();
  const preview = {
    BH: "B\"H",
    ok: true,
    id: previewId,
    ownerUserId: userId,
    tunnelName: normalized.tunnelName || normalized.targetVessel || "awtsmoos-virtual-os",
    targetVessel: normalized.targetVessel || normalized.tunnelName || "awtsmoos-virtual-os",
    kind: normalized.kind,
    title: normalized.title || titleFor(normalized),
    source: normalized.source || sourceFor(normalized),
    visibility: normalized.visibility,
    allowDownload: normalized.allowDownload,
    allowFolderBrowse: normalized.allowFolderBrowse,
    allowSearch: normalized.allowSearch,
    allowRaw: normalized.allowRaw,
    createdBy: normalized.createdBy || (normalized.ai ? "ai" : "user"),
    aiEditable: normalized.aiEditable !== false,
    createdAt: at,
    expiresAt: at + normalized.ttlSeconds * 1000,
    openedCount: 0,
    revoked: false
  };
  bucket.previews[previewId] = preview;
  writeStore(store);
  return withUrls(preview);
}

function titleFor(input) {
  if (input.kind === "proxy") return `Proxy ${input.url || input.port || "server"}`;
  if (input.kind === "page") return input.title || "Dynamic Awtsmoos Page";
  return input.title || input.path || input.actionId || "Awtsmoos Preview";
}

function sourceFor(input) {
  if (input.kind === "page") return { html: input.html || "", css: input.css || "", data: input.data || null };
  if (input.kind === "proxy") return { url: input.url || "", port: input.port || null, path: input.proxyPath || "/" };
  if (input.kind === "action") return { actionId: input.actionId || "" };
  return { path: input.path || input.p || "." };
}

function withUrls(preview) {
  const url = `${baseUrl()}/view/${encodeURIComponent(preview.id)}`;
  return { ...preview, url, viewUrl: url, rawUrl: `${url}/raw`, wsUrl: `${url}/ws` };
}

function getPreview(userId, previewId, options = {}) {
  const store = readStore();
  const bucket = ensure(store, userId || "anonymous");
  const preview = bucket.previews[String(previewId || "")];
  if (!preview) return null;
  if (preview.revoked) return null;
  if (preview.expiresAt <= now()) return null;
  if (preview.visibility === "private" && options.publicAccess) return null;
  if (preview.visibility === "one-time" && preview.openedCount > 0) return null;
  preview.openedCount += options.countOpen === false ? 0 : 1;
  writeStore(store);
  return withUrls(preview);
}

function findPreviewAny(previewId) {
  const store = readStore();
  const users = store.previewGateway?.users || {};
  for (const [userId, bucket] of Object.entries(users)) {
    const preview = bucket.previews?.[previewId];
    if (preview && !preview.revoked && preview.expiresAt > now()) return { userId, preview: withUrls(preview) };
  }
  return null;
}

function listPreviews(userId) {
  const store = readStore();
  const bucket = ensure(store, userId);
  return Object.values(bucket.previews).filter(p => !p.revoked && p.expiresAt > now()).map(withUrls).sort((a, b) => b.createdAt - a.createdAt);
}

function revokePreview(userId, previewId) {
  const store = readStore();
  const bucket = ensure(store, userId);
  if (!bucket.previews[previewId]) return { ok: false, error: "preview_not_found" };
  bucket.previews[previewId].revoked = true;
  writeStore(store);
  return { ok: true, id: previewId };
}

function updatePreview(userId, previewId, patch = {}) {
  const store = readStore();
  const bucket = ensure(store, userId);
  const existing = bucket.previews[previewId];
  if (!existing) return { ok: false, error: "preview_not_found" };
  const policy = aiPolicyCheck({ ...existing, ...patch }, bucket.settings);
  if (!policy.ok) return policy;
  const next = normalizePreview({ ...existing, ...patch }, bucket.settings);
  bucket.previews[previewId] = { ...existing, ...next, updatedAt: now() };
  writeStore(store);
  return withUrls(bucket.previews[previewId]);
}

module.exports = { createPreview, findPreviewAny, getPreview, listPreviews, revokePreview, settingsGet, settingsSet, updatePreview, withUrls };
