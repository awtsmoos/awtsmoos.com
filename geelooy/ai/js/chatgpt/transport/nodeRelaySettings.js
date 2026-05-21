//B"H

const KEY = "BH_awtsmoos_ai_node_relay_v1";

export const DEFAULT_NODE_RELAY_SETTINGS = Object.freeze({
  enabled: false,
  url: "http://127.0.0.1:38488"
});

/**
 * Chapter 46: The Small Door Beside the Extension.
 *
 * The Awtsmoos gives the browser two vessels for the same mission: the Chrome
 * extension bridge, and a tiny localhost Node relay. This store keeps only the
 * user's chosen relay door, never secrets.
 *
 * @returns {{enabled:boolean,url:string}} Current relay settings.
 */
export function loadNodeRelaySettings() {
  try { return normalize(JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch { return { ...DEFAULT_NODE_RELAY_SETTINGS }; }
}

/**
 * @param {Partial<{enabled:boolean,url:string}>} next Partial relay settings.
 * @returns {{enabled:boolean,url:string}} Saved relay settings.
 */
export function saveNodeRelaySettings(next = {}) {
  const settings = normalize({ ...loadNodeRelaySettings(), ...next });
  localStorage.setItem(KEY, JSON.stringify(settings));
  return settings;
}

function normalize(value = {}) {
  const url = String(value.url || DEFAULT_NODE_RELAY_SETTINGS.url).replace(/\/+$/, "");
  return { enabled: Boolean(value.enabled), url };
}
