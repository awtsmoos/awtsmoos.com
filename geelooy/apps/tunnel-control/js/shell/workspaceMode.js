
// B"H

import { PANE_META } from "../router/paneMeta.js";

/**
 * B"H
 * Shows home dashboard.
 *
 * @returns {void}
 */
export function showDashboardHome() {
  document.body.classList.add("awt-home-mode");
  document.body.classList.remove("awt-workspace-mode");
}

/**
 * B"H
 * Updates workspace title.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
function updateTitle(pane) {
  const title = document.getElementById("awtWorkspaceTitle");
  if (!title) return;

  title.textContent = PANE_META[pane]?.title || pane || "Workspace";
}

/**
 * B"H
 * Mounts workspace mode.
 *
 * @returns {void}
 */
export function mountWorkspaceMode() {
  document.getElementById("awtBackDashboard")?.addEventListener("click", event => {
    event.preventDefault();
    showDashboardHome();
  });

  document.addEventListener("awt:pane-change", event => {
    updateTitle(event.detail?.pane || "");
  });

  showDashboardHome();
}
