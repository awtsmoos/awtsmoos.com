
// B"H

/**
 * B"H
 * Finds the current application root.
 *
 * @returns {HTMLElement} Root element.
 */
export function findAppRoot() {
  return document.querySelector("main") ||
    document.querySelector("#app") ||
    document.querySelector(".app") ||
    document.querySelector(".wrap") ||
    document.querySelector(".container") ||
    document.body;
}

/**
 * B"H
 * Collects panes from anywhere before the shell replaces the root.
 *
 * @returns {HTMLElement[]} Pane nodes.
 */
export function collectPanes() {
  return Array.from(document.querySelectorAll("[data-pane]"))
    .filter(node => node instanceof HTMLElement);
}

/**
 * B"H
 * Creates a diagnostic pane if the old HTML has no panes.
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
    "<p>The shell mounted, but no data-pane sections were found in the old page.</p>",
    "</div>"
  ].join("");

  return pane;
}
