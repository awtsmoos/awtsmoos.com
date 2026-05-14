
// B"H

/**
 * B"H
 * Fetches tunnel status from the existing Awtsmoos tunnel API.
 *
 * @returns {Promise<object>} Status JSON.
 */
export async function fetchTunnelStatus() {
  const res = await fetch("/api/tunnel/status", {
    headers: {
      Accept: "application/json"
    }
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      ok: false,
      error: "Status did not return JSON.",
      raw: text
    };
  }
}

/**
 * B"H
 * Formats status JSON into readable console text.
 *
 * @param {object} status Status result.
 * @returns {string} Pretty status.
 */
export function formatStatus(status) {
  return JSON.stringify(status, null, 2);
}
