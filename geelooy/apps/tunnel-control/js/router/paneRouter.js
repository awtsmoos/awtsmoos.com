
// B"H

/**
 * B"H
 * Returns all mounted panes.
 *
 * @returns {HTMLElement[]} Pane nodes.
 */
export function panes() {
  return Array.from(document.querySelectorAll("[data-pane]"));
}

/**
 * B"H
 * Gets active pane key.
 *
 * @returns {string} Active pane key.
 */
export function getActivePane() {
  return panes().find(pane => pane.classList.contains("active"))?.dataset.pane || "";
}

/**
 * B"H
 * Syncs nav/card active state.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
function syncNav(pane) {
  for (const node of document.querySelectorAll("[data-tab], [data-awt-navigate]")) {
    const key = node.dataset.tab || node.dataset.awtNavigate;
    const yes = key === pane;

    node.classList.toggle("active", yes);
    node.setAttribute("aria-selected", yes ? "true" : "false");
  }
}

/**
 * B"H
 * Opens one pane as the active workspace.
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
 * Returns to dashboard.
 *
 * @returns {void}
 */
export function showHome() {
  for (const node of panes()) node.classList.remove("active");

  syncNav("");
  document.body.classList.add("awt-home-mode");
  document.body.classList.remove("awt-workspace-mode");
}
