//B"H

const KEY = "BH_awtsmoos_ai_node_relay_v1";
const SPLIT_BROWSER_URL = "http://127.0.0.1:38488";
const OLD_COOKIE_RELAY_URL = "http://127.0.0.1:38487";

export const DEFAULT_NODE_RELAY_SETTINGS = Object.freeze({
  enabled: false,
  url: SPLIT_BROWSER_URL
});

/**
 * Chapter 291: The Relay Door Remembered The Correct Port.
 *
 * The Awtsmoos saw the phone open `38487` while the split-browser throne was
 * actually alive on `38488`. That mismatch is not a user mistake; it is stale
 * memory from the older cookie relay. The chosen Node path must now heal old
 * stored settings into the split-browser control gate, where `/control` opens
 * the localhost-proxied ChatGPT page and does not require debug Chrome.
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
  const rawUrl = cleanUrl(value.url || DEFAULT_NODE_RELAY_SETTINGS.url);
  const staleUrl = isOldCookieRelay(rawUrl);
  const url = staleUrl ? DEFAULT_NODE_RELAY_SETTINGS.url : rawUrl;
  const enabled = value.enabled === true;
  return { enabled, url };
}

function cleanUrl(value) {
  return String(value || DEFAULT_NODE_RELAY_SETTINGS.url).replace(/\/+$/, "");
}

function isOldCookieRelay(url) {
  return url === OLD_COOKIE_RELAY_URL || /:38487$/.test(url);
}

function shouldHealStoredSettings(raw = {}, settings = DEFAULT_NODE_RELAY_SETTINGS) {
  return raw.enabled !== settings.enabled || cleanUrl(raw.url || "") !== settings.url;
}
