
// B"H

/**
 * B"H
 * Hides stale no-tunnel blocks after a tunnel is resolved.
 *
 * The old landing layer can still print "No tunnel selected" even when the
 * new session flow already resolved the tunnel. This surgical cleanup only
 * hides blocks containing that exact stale message.
 *
 * @param {string} tunnelName Active tunnel name.
 * @returns {void}
 */
export function cleanStaleNoTunnelPanels(tunnelName) {
  if (!tunnelName) return;

  document.body.classList.add("awt-has-tunnel");

  const candidates = Array.from(document.querySelectorAll("section, article, .card, .panel, div"))
    .filter(node => {
      const text = (node.textContent || "").trim();
      return text.includes("No tunnel selected") &&
        text.includes("Install the local agent first");
    });

  for (const node of candidates) {
    const pane = node.closest("[data-pane]");
    if (pane && pane.children.length < 4) {
      pane.classList.add("awt-stale-no-tunnel");
      continue;
    }

    node.classList.add("awt-stale-no-tunnel");
  }
}

/**
 * B"H
 * Normalizes compressed status text like AgentConnected.
 *
 * @returns {void}
 */
export function fixCompressedStatusText() {
  for (const node of document.querySelectorAll(".status, [id*='status'], [id*='device'], [id*='tunnel']")) {
    if (!(node instanceof HTMLElement)) continue;
    node.classList.add("awt-readable-status");
  }
}
