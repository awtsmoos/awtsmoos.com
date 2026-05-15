
// B"H

/**
 * B"H
 * Collects every real pane before the old page is removed.
 *
 * @returns {HTMLElement[]} Pane nodes.
 */
export function collectPanes() {
  const panes = Array.from(document.querySelectorAll("[data-pane]"))
    .filter(node => node instanceof HTMLElement);

  return dedupePanes(panes);
}

/**
 * B"H
 * Removes duplicate pane keys while preserving order.
 *
 * @param {HTMLElement[]} panes Pane nodes.
 * @returns {HTMLElement[]} Unique panes.
 */
function dedupePanes(panes) {
  const seen = new Set();
  const out = [];

  for (const pane of panes) {
    const key = pane.dataset.pane || "";
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(pane);
  }

  return out;
}

/**
 * B"H
 * Creates a fallback pane when the old page has no data-pane nodes.
 *
 * @returns {HTMLElement} Fallback pane.
 */
export function createFallbackPane() {
  const pane = document.createElement("section");
  pane.dataset.pane = "diagnostic";

  pane.innerHTML = [
    "<div class='awt-pane-heading'>",
    "<div class='awt-pane-kicker'>DIAGNOSTIC</div>",
    "<h2>No panes found</h2>",
    "<p>The dashboard mounted, but the old page had no [data-pane] sections.</p>",
    "</div>"
  ].join("");

  return pane;
}
