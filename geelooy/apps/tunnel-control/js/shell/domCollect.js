
// B"H

/**
 * B"H
 * Finds the main app root.
 *
 * @returns {HTMLElement} App root.
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
 * Finds the existing tab rail.
 *
 * @returns {HTMLElement|null} Existing tab parent.
 */
export function findTabRail() {
  const tab = document.querySelector("[data-tab]");
  return tab ? tab.parentElement : null;
}

/**
 * B"H
 * Collects all panes from anywhere in the app before rebuilding DOM.
 *
 * @returns {HTMLElement[]} Pane nodes.
 */
export function collectPanes() {
  return Array.from(document.querySelectorAll("[data-pane]"))
    .filter(node => node instanceof HTMLElement);
}

/**
 * B"H
 * Removes stale empty install/warning blocks from the old landing flow.
 *
 * @returns {void}
 */
export function markOldChromeArtifacts() {
  document.body.classList.add("awt-shell-mounted");
}
