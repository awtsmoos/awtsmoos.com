// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { createPreview, listPreviews, revokePreview, settingsGet, settingsSet, updatePreview } = require("../preview/previewStore.js");

function params($i) { return { ...($i?.paramKinds?.GET || {}), ...($i?.paramKinds?.POST || {}) }; }
function parseJson(value, fallback = {}) { if (!value) return fallback; try { return JSON.parse(String(value)); } catch { return fallback; } }
function from64(value) { if (!value) return ""; try { return Buffer.from(String(value), "base64").toString("utf8"); } catch { return ""; } }
function requireUser($i) { const ident = currentIdentity($i); return ident.ok ? ident : null; }

/**
 * B"H
 * Chapter: The API became the hand that shapes view links.
 */
async function previewSettingsGet($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  return json($i, { BH: "B\"H", ok: true, settings: settingsGet(ident.userId) });
}

async function previewSettingsSet($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  const p = params($i);
  const patch = parseJson(from64(p.settings64) || p.settings || p.content || "{}", p);
  return json($i, { BH: "B\"H", ok: true, settings: settingsSet(ident.userId, patch) });
}

async function previewCreate($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  const p = params($i);
  const body = parseJson(from64(p.preview64) || p.preview || p.content || "{}", {});
  const input = { ...p, ...body, html: from64(p.html64) || body.html || p.html, css: from64(p.css64) || body.css || p.css, createdBy: p.createdBy || body.createdBy || "user" };
  const got = createPreview(ident.userId, input);
  return json($i, got, got.ok === false ? 403 : 200);
}

async function previewList($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  return json($i, { BH: "B\"H", ok: true, previews: listPreviews(ident.userId) });
}

async function previewRevoke($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  const got = revokePreview(ident.userId, params($i).previewId || params($i).id);
  return json($i, got, got.ok === false ? 404 : 200);
}

async function previewUpdate($i) {
  const ident = requireUser($i);
  if (!ident) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  const p = params($i);
  const patch = parseJson(from64(p.patch64) || p.patch || p.content || "{}", p);
  const got = updatePreview(ident.userId, p.previewId || p.id, patch);
  return json($i, got, got.ok === false ? 403 : 200);
}

module.exports = { previewCreate, previewList, previewRevoke, previewSettingsGet, previewSettingsSet, previewUpdate };
