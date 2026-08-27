
// B"H

/**
 * B"H
 * Extracts a tunnel name from the real server shapes.
 *
 * The control endpoint may return the tunnel name at top level or inside
 * a device object. This helper keeps the boot flow calm and exact.
 *
 * @param {object} raw Raw response.
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
 * Extracts the local root from the active device/config response.
 *
 * @param {object} raw Raw response.
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

/**
 * B"H
 * Extracts permission booleans for visible status.
 *
 * @param {object} raw Raw response.
 * @returns {object} Permission object.
 */
export function extractPermissions(raw) {
  const config = raw?.liveConfig || raw?.config || raw?.device?.config || raw || {};

  return {
    allowWrite: !!config.allowWrite,
    allowCommands: !!config.allowCommands,
    allowBrowser: !!config.allowBrowser,
    allowHttpProxy: !!config.allowHttpProxy
  };
}
