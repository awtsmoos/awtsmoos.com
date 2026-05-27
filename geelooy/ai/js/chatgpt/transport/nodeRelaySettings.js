//B"H

const KEY = "BH_awtsmoos_ai_node_relay_v1";

export const DEFAULT_NODE_RELAY_SETTINGS = Object.freeze({
  enabled: true,
  url: "http://127.0.0.1:38487"
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
  try {
    const raw = localStorage.getItem(KEY);
    const settings = normalize(JSON.parse(raw || "{}"));
    if (raw && shouldHealStoredSettings(JSON.parse(raw || "{}"), settings)) {
      localStorage.setItem(KEY, JSON.stringify(settings));
    }
    return settings;
  } catch {
    return { ...DEFAULT_NODE_RELAY_SETTINGS };
  }
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
  const rawUrl = String(value.url || DEFAULT_NODE_RELAY_SETTINGS.url).replace(/\/+$/, "");
  const staleUrl = /:38488$/.test(rawUrl);
  const url = staleUrl ? DEFAULT_NODE_RELAY_SETTINGS.url : rawUrl;
  const enabled = value.enabled === false && !staleUrl ? false : DEFAULT_NODE_RELAY_SETTINGS.enabled;
  return { enabled, url };
}

function shouldHealStoredSettings(raw = {}, settings = DEFAULT_NODE_RELAY_SETTINGS) {
  return raw.enabled !== settings.enabled || String(raw.url || "").replace(/\/+$/, "") !== settings.url;
}
