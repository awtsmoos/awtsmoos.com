
// B"H

/**
 * B"H
 * Finds a tunnel name from any reasonable server shape.
 *
 * @param {object} raw Device response.
 * @returns {string} Tunnel name.
 */
export function extractTunnelName(raw) {
  const device = raw?.device || raw?.tunnel || raw || {};
  return String(
    raw?.tunnelName ||
    device?.tunnelName ||
    device?.name ||
    device?.id ||
    ""
  ).trim();
}

/**
 * B"H
 * Finds a root path from any reasonable server shape.
 *
 * @param {object} raw Device/config response.
 * @returns {string} Root path.
 */
export function extractRoot(raw) {
  const device = raw?.device || raw?.tunnel || raw || {};
  return String(
    raw?.liveConfig?.root ||
    raw?.config?.root ||
    raw?.root ||
    raw?.projectRoot ||
    device?.root ||
    device?.projectRoot ||
    "."
  ).trim() || ".";
}
