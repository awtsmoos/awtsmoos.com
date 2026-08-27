// B"H
const { readStore, writeStore } = require("./store.js");

const AUTO = "auto";
const VIRTUAL = "awtsmoos-virtual-os";

/**
 * B"H
 * Chapter 493: The road remembered the traveler, not every passerby.
 *
 * A scoped chat may keep a chosen vessel. An unscoped AI action may not crown a
 * global default and then send another agent down the wrong road. The Awtsmoos
 * reveals precision: sticky state belongs only to a conversation, unless a real
 * UI/user selection explicitly asks for a global memory.
 */
function applyRoutePreference(userId, conversationId, tunnelName, payload = {}) {
  const requested = clean(tunnelName || AUTO);
  if (!isAuto(requested) || explicitVessel(payload)) return { tunnelName: requested, sticky: null };
  const sticky = getRoutePreference(userId, conversationId);
  if (!sticky || !sticky.tunnelName) return { tunnelName: requested, sticky: null };
  return { tunnelName: sticky.tunnelName, sticky };
}

function rememberRoutePreference(userId, conversationId, vessel = {}, payload = {}) {
  if (!userId || !vessel || vessel.kind === "missing") return null;
  const explicit = explicitRoute(vessel, payload);
  if (!explicit) return null;
  const key = conversationId ? cleanId(conversationId) : "";
  const mayWriteDefault = globalPreferenceAllowed(payload);
  if (!key && !mayWriteDefault) return null;
  const store = readStore();
  const bucket = bucketFor(store, userId);
  const current = (key && bucket.conversations[key]) || (mayWriteDefault && bucket.default) || null;
  const record = { tunnelName: vessel.tunnelName || explicit.tunnelName, targetVessel: explicit.targetVessel, kind: vessel.kind, reason: vessel.reason || "", updatedAt: Date.now() };
  if (sameRoute(current, record)) return current;
  if (key) bucket.conversations[key] = record;
  if (mayWriteDefault) bucket.default = record;
  writeStore(store);
  return record;
}

function getRoutePreference(userId, conversationId) {
  const store = readStore();
  const bucket = bucketFor(store, userId);
  return (conversationId && bucket.conversations[cleanId(conversationId)]) || bucket.default || null;
}

function globalPreferenceAllowed(payload = {}) {
  return payload.persistGlobalRoute === true || payload.persistGlobalRoute === "true" || payload.explicitUserSelection === true || payload.explicitUserSelection === "true" || payload.rememberGlobalRoute === true || payload.rememberGlobalRoute === "true";
}

function explicitRoute(vessel, payload = {}) {
  const target = explicitVessel(payload);
  if (target === "virtual-os" || clean(vessel.tunnelName) === VIRTUAL) return { tunnelName: VIRTUAL, targetVessel: "virtual-os" };
  if (target === "native-tunnel" || target === "browser-tab") return { tunnelName: vessel.tunnelName, targetVessel: target };
  if (vessel.reason && /^(exact_|explicit_|auto_single_)/.test(vessel.reason) && vessel.tunnelName && clean(vessel.tunnelName) !== AUTO) return { tunnelName: vessel.tunnelName, targetVessel: vessel.kind };
  return null;
}

function explicitVessel(payload = {}) { return normalizeVessel(payload.targetVessel || payload.vessel || payload.fs || payload.routeHints?.targetVessel || ""); }
function normalizeVessel(value) { const text = clean(value); if (["native", "native-local", "native-tunnel", "local", "local-tunnel"].includes(text)) return "native-tunnel"; if (["browser", "browser-tab", "tab", "code-tab", "apps-code"].includes(text)) return "browser-tab"; if (["virtual", "virtual-os", "awtsmoos-os", "awtsmoos-virtual-os", "hosted"].includes(text)) return "virtual-os"; return ""; }
function bucketFor(store, userId) { store.routePreferences = store.routePreferences || { users: {} }; const users = store.routePreferences.users; users[userId] = users[userId] || { default: null, conversations: {} }; users[userId].conversations = users[userId].conversations || {}; return users[userId]; }
function clean(value) { return String(value || "").trim().toLowerCase(); }
function isAuto(value) { return clean(value) === AUTO || clean(value) === ""; }
function cleanId(value) { return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80); }
function sameRoute(a, b) { return !!a && a.tunnelName === b.tunnelName && a.targetVessel === b.targetVessel && a.kind === b.kind; }

module.exports = { applyRoutePreference, getRoutePreference, rememberRoutePreference, globalPreferenceAllowed };
