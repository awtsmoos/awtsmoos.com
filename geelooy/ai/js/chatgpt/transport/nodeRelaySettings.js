//B"H

const KEY = "BH_awtsmoos_ai_node_relay_v1";

export const DEFAULT_NODE_RELAY_SETTINGS = Object.freeze({
  enabled: false,
  url: "http://127.0.0.1:38487"
});

/**
 * Chapter 102: The Silent Door Stays Closed Until Chosen.
 *
 * The Awtsmoos reveals two possible roads for ChatGPT traffic: the Chrome
 * extension bridge, which owns the normal cockpit, and the localhost relay,
 * which is a separate chosen vessel. This store must never awaken the relay by
 * default during page boot; otherwise a dead localhost check can steal time from
 * the extension and leave the sidebar whispering "reconnecting" instead of
 * showing the living conversations.
 *
 * @returns {{enabled:boolean,url:string}} Saved relay settings with safe defaults.
 */
export function loadNodeRelaySettings() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = JSON.parse(raw || "{}");
    const settings = normalize(parsed);
    if (raw && shouldHealStoredSettings(parsed, settings)) {
      localStorage.setItem(KEY, JSON.stringify(settings));
    }
    return settings;
  } catch {
    return { ...DEFAULT_NODE_RELAY_SETTINGS };
  }
}

/**
 * B"H — Saves the human's explicit relay choice.
 *
 * @param {Partial<{enabled:boolean,url:string}>} next Partial relay settings.
 * @returns {{enabled:boolean,url:string}} Saved relay settings.
 */
export function saveNodeRelaySettings(next = {}) {
  const settings = normalize({ ...loadNodeRelaySettings(), ...next });
  localStorage.setItem(KEY, JSON.stringify(settings));
  return settings;
}

/**
 * B"H — Answers whether boot code may even touch localhost relay health.
 *
 * @returns {boolean} True only after explicit user selection.
 */
export function isNodeRelayEnabled() {
  return loadNodeRelaySettings().enabled === true;
}

function normalize(value = {}) {
  const rawUrl = String(value.url || DEFAULT_NODE_RELAY_SETTINGS.url).replace(/\/+$/, "");
  const staleUrl = /:38488$/.test(rawUrl);
  const url = staleUrl ? DEFAULT_NODE_RELAY_SETTINGS.url : rawUrl;
  const enabled = !staleUrl && value.enabled === true;
  return { enabled, url };
}

function shouldHealStoredSettings(raw = {}, settings = DEFAULT_NODE_RELAY_SETTINGS) {
  return raw.enabled !== settings.enabled || String(raw.url || "").replace(/\/+$/, "") !== settings.url;
}
