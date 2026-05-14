
// B"H

/**
 * B"H
 * Fetches installer endpoint status.
 *
 * @returns {Promise<string>} Status text.
 */
export async function fetchTunnelStatus() {
  const res = await fetch("/api/tunnel/install/status", {
    headers: {
      Accept: "text/plain"
    }
  });

  return await res.text();
}

/**
 * B"H
 * Formats status text.
 *
 * @param {string} status Status text.
 * @returns {string} Pretty status.
 */
export function formatStatus(status) {
  return status;
}
