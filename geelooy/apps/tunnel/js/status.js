
// B"H

/**
 * B"H
 * Fetches installer endpoint status.
 *
 * @returns {Promise<string>} Status text.
 */
export async function fetchTunnelStatus(timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("/api/tunnel/install/status", {
      headers: {
        Accept: "text/plain"
      },
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`installer endpoint answered HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    if (e && e.name === "AbortError") {
      throw new Error("Installer endpoint did not answer within 10s — the server may be busy. Use Refresh to retry.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
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
