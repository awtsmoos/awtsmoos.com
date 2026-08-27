//B"H

const KEY = "BH_awtsmoos_ai_node_relay_v1";
const SPLIT_BROWSER_URL = "http://127.0.0.1:38488";
const OLD_COOKIE_RELAY_URL = "http://127.0.0.1:38487";
const TUNNEL_LOCAL_API_URL = "http://127.0.0.1:3977";
const MODES = new Set(["extension", "node", "tunnel"]);

export const DEFAULT_NODE_RELAY_SETTINGS = Object.freeze({
  enabled: false,
  mode: "extension",
  url: SPLIT_BROWSER_URL,
  tunnelUrl: TUNNEL_LOCAL_API_URL,
  useMerkavaExecutor: true
});

/**
 * Chapter 9: Three Gates Stood Under One Crown.
 *
 * Extension, Node relay, and Awtsmoos Tunnel are separate gates. The Awtsmoos
 * lets the user choose one without destroying the others: old `enabled` storage
 * still means Node relay, while new `mode` storage can point to Tunnel and keep
 * MerkavaExecutor ready when Chrome cannot answer.
 *
 * @returns {{enabled:boolean,mode:string,url:string,tunnelUrl:string,useMerkavaExecutor:boolean}} Saved relay settings.
 */
export function loadNodeRelaySettings() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = JSON.parse(raw || "{}");
    const settings = normalize(parsed);
    if (raw && shouldHealStoredSettings(parsed, settings)) localStorage.setItem(KEY, JSON.stringify(settings));
    return settings;
  } catch {
    return { ...DEFAULT_NODE_RELAY_SETTINGS };
  }
}

/**
 * B"H — Saves the chosen transport gate.
 * @param {Partial<typeof DEFAULT_NODE_RELAY_SETTINGS>} next Partial settings.
 * @returns {typeof DEFAULT_NODE_RELAY_SETTINGS} Saved settings.
 */
export function saveNodeRelaySettings(next = {}) {
  const settings = normalize({ ...loadNodeRelaySettings(), ...next });
  localStorage.setItem(KEY, JSON.stringify(settings));
  return settings;
}

export function isNodeRelayEnabled() {
  const settings = loadNodeRelaySettings();
  return settings.enabled === true && settings.mode === "node";
}

export function isTunnelRelayEnabled() {
  const settings = loadNodeRelaySettings();
  return settings.enabled === true && settings.mode === "tunnel";
}

export function selectedTransportMode() {
  return loadNodeRelaySettings().mode;
}

function normalize(value = {}) {
  const inheritedMode = value.mode || (value.enabled === true ? "node" : "extension");
  const mode = MODES.has(inheritedMode) ? inheritedMode : DEFAULT_NODE_RELAY_SETTINGS.mode;
  const rawUrl = cleanUrl(value.url || DEFAULT_NODE_RELAY_SETTINGS.url, DEFAULT_NODE_RELAY_SETTINGS.url);
  const url = isOldCookieRelay(rawUrl) ? DEFAULT_NODE_RELAY_SETTINGS.url : rawUrl;
  const tunnelUrl = cleanUrl(value.tunnelUrl || DEFAULT_NODE_RELAY_SETTINGS.tunnelUrl, DEFAULT_NODE_RELAY_SETTINGS.tunnelUrl);
  const enabled = mode !== "extension" && value.enabled !== false;
  const useMerkavaExecutor = value.useMerkavaExecutor !== false;
  return { enabled, mode, url, tunnelUrl, useMerkavaExecutor };
}

function cleanUrl(value, fallback) {
  return String(value || fallback).replace(/\/+$/, "");
}

function isOldCookieRelay(url) {
  return url === OLD_COOKIE_RELAY_URL || /:38487$/.test(url);
}

function shouldHealStoredSettings(raw = {}, settings = DEFAULT_NODE_RELAY_SETTINGS) {
  return raw.enabled !== settings.enabled || raw.mode !== settings.mode || cleanUrl(raw.url || "", "") !== settings.url || cleanUrl(raw.tunnelUrl || "", "") !== settings.tunnelUrl || raw.useMerkavaExecutor !== settings.useMerkavaExecutor;
}
