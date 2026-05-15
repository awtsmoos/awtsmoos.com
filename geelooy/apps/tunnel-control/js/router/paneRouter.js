
// B"H

/**
 * B"H
 * Returns all panes.
 *
 * @returns {HTMLElement[]} Pane nodes.
 */
export function panes() {
  return Array.from(document.querySelectorAll("[data-pane]"));
}

/**
 * B"H
 * Gets the active pane key.
 *
 * @returns {string} Active pane.
 */
export function getActivePane() {
  return panes().find(p => p.classList.contains("active"))?.dataset.pane || "";
}

/**
 * B"H
 * Syncs side nav active state.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
function syncNav(pane) {
  for (const tab of document.querySelectorAll("[data-tab], [data-awt-navigate]")) {
    const key = tab.dataset.tab || tab.dataset.awtNavigate;
    const yes = key === pane;
    tab.classList.toggle("active", yes);
    tab.setAttribute("aria-selected", yes ? "true" : "false");
  }
}

/**
 * B"H
 * Activates a pane and enters workspace mode.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
export function activatePane(pane) {
  let found = false;

  for (const node of panes()) {
    const yes = node.dataset.pane === pane;
    node.classList.toggle("active", yes);
    if (yes) found = true;
  }

  if (!found) return;

  syncNav(pane);

  document.body.classList.remove("awt-home-mode");
  document.body.classList.add("awt-workspace-mode");

  document.dispatchEvent(new CustomEvent("awt:pane-change", {
    detail: { pane }
  }));
}

/**
 * B"H
 * Clears active pane and returns home.
 *
 * @returns {void}
 */
export function showHome() {
  document.body.classList.add("awt-home-mode");
  document.body.classList.remove("awt-workspace-mode");
  syncNav("");
}
