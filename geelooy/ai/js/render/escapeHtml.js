//B"H
/**
 * Escapes the small raw sparks before they enter HTML vessels.
 * @param {unknown} value - Any value from the transport stream.
 * @returns {string} Safe text for HTML insertion.
 */
export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
