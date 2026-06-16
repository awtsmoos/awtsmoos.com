// B"H
const { cleanPath, splitPath } = require("./path.js");

/**
 * B"H
 * Chapter 33: The lantern learned to judge the smoke of each route.
 *
 * Virtual OS writes expose route candidates and a tiny verification grammar.
 * Candidate URLs are not truth until checked; this module now also classifies
 * the result of a later httpRequest/simulateRuntime probe.
 */
function publicUrlReport(payload = {}, parsed = null) {
  const got = parsed || safeSplit(payload.path || payload.p || ".");
  if (!got || got.root || !got.aliasId) return null;
  const path = cleanPath(payload.path || payload.p || ".");
  const appPath = appRoute(got.aliasId, got.innerPath);
  const origin = publicOrigin(payload);
  const candidates = [
    `${origin}/geelooy/os/${enc(got.aliasId)}/${encPath(got.innerPath)}`.replace(/\/+$/g, ""),
    `${origin}/apps/${enc(got.aliasId)}/${encPath(got.innerPath)}`.replace(/\/+$/g, ""),
    `${origin}/u/${enc(got.aliasId)}/${encPath(got.innerPath)}`.replace(/\/+$/g, "")
  ];
  if (appPath) candidates.unshift(`${origin}${appPath}`);
  const unique = [...new Set(candidates.filter(Boolean))];
  return { path, aliasId: got.aliasId, innerPath: got.innerPath, appPath, candidates: unique, verification: verificationPlan(unique) };
}

function verificationPlan(candidates = []) {
  return {
    required: true,
    actions: ["httpRequest", "simulateRuntime"],
    candidates,
    rejectPatterns: ["DYN_ROUTE_NOT_FOUND", "Cannot GET", "404", "not found"],
    acceptSignals: ["status 200", "expected title", "expected DOM", "non-empty HTML"],
    guidance: "Treat candidates as untrusted until checked. Verify one candidate renders expected title/DOM before reporting it as final. If DYN_ROUTE_NOT_FOUND appears, reject that route and continue tracing."
  };
}

function classifyCandidateResult(result = {}) {
  const status = Number(result.status || result.statusCode || result.response?.status || 0);
  const body = String(result.body || result.text || result.content || result.html || result.stdout || "");
  const lower = body.toLowerCase();
  const rejected = status >= 400 || body.includes("DYN_ROUTE_NOT_FOUND") || lower.includes("cannot get") || lower.includes("not found");
  if (rejected) return { ok: false, verdict: "rejected", status, reason: body.includes("DYN_ROUTE_NOT_FOUND") ? "DYN_ROUTE_NOT_FOUND" : status >= 400 ? `http_${status}` : "not_found_text" };
  const accepted = status === 200 || /<html|<!doctype|<body|<div|<main|<script/i.test(body);
  return { ok: accepted, verdict: accepted ? "candidate_verified" : "inconclusive", status, reason: accepted ? "render_signal_found" : "no_render_signal" };
}

function publicOrigin(payload = {}) {
  const value = payload.publicOrigin || payload.origin || payload.baseUrl || payload.urlOrigin || "https://awtsmoos.com";
  return String(value).replace(/\/+$/g, "");
}

function appRoute(aliasId, innerPath = "") {
  const parts = String(innerPath || "").split("/").filter(Boolean);
  const appsIndex = parts.findIndex(x => x === "apps");
  if (appsIndex >= 0 && parts[appsIndex + 1]) return `/apps/${encPath(parts.slice(appsIndex + 1).join("/"))}`.replace(/\/+$/g, "");
  const cobyIndex = parts.findIndex(x => x === "Coby");
  if (cobyIndex >= 0 && parts[cobyIndex + 1]) return `/apps/${encPath(parts.slice(cobyIndex + 1).join("/"))}`.replace(/\/+$/g, "");
  return "";
}

function safeSplit(path) {
  try { return splitPath(path); } catch (_) { return null; }
}

function enc(value) { return encodeURIComponent(String(value || "")); }
function encPath(value = "") { return String(value || "").split("/").filter(Boolean).map(enc).join("/"); }

module.exports = { appRoute, classifyCandidateResult, publicOrigin, publicUrlReport, verificationPlan };
