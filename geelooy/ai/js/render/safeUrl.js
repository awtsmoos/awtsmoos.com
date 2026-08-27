//B"H

/**
 * B"H — a small gatekeeper for links born from model/provider text.
 *
 * Escaping HTML is not enough for anchors; href attributes also need protocol
 * validation and entity normalization. This vessel accepts only ordinary HTTP
 * gates and rejects script/data/file sparks before they touch the DOM.
 *
 * @param {unknown} value Candidate URL.
 * @returns {string} Absolute safe HTTP(S) href, or empty string.
 */
export function safeHttpUrl(value) {
  try {
    const decoded = decodeHtmlAmp(String(value || "").trim());
    if (!decoded || /[\u0000-\u001f\u007f]/.test(decoded)) return "";
    const parsed = new URL(decoded);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

/**
 * @param {unknown} value Candidate URL.
 * @returns {boolean} True only for validated HTTP(S) URLs.
 */
export function isSafeHttpUrl(value) {
  return Boolean(safeHttpUrl(value));
}

function decodeHtmlAmp(value) {
  let out = String(value || "");
  for (let i = 0; i < 3 && out.includes("&amp;"); i++) out = out.replace(/&amp;/g, "&");
  return out;
}
