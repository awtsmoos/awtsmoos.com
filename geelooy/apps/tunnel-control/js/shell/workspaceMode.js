
// B"H

import { getActivePane } from "../router/paneRouter.js";

/**
 * B"H
 * Sets the app into home mode.
 *
 * @returns {void}
 */
export function showDashboardHome() {
  document.body.classList.add("awt-home-mode");
  document.body.classList.remove("awt-workspace-mode");
}

/**
 * B"H
 * Sets the app into workspace mode.
 *
 * @param {string} pane Active pane key.
 * @returns {void}
 */
export function showWorkspace(pane) {
  document.body.classList.remove("awt-home-mode");
  document.body.classList.add("awt-workspace-mode");
  updateWorkspaceHeader(pane);
}

/**
 * B"H
 * Updates the workspace title from the active pane heading.
 *
 * @param {string} pane Pane key.
 * @returns {void}
 */
export function updateWorkspaceHeader(pane) {
  const titleNode = document.getElementById("awtWorkspaceTitle");
  if (!titleNode) return;

  const activePane =
    document.querySelector(`[data-pane="${CSS.escape(pane)}"]`) ||
    document.querySelector('[data-pane].active');

  const title =
    activePane?.querySelector(".awt-pane-heading h2")?.textContent ||
    activePane?.querySelector("h2")?.textContent ||
    pane ||
    "Workspace";

  titleNode.textContent = title;
}

/**
 * B"H
 * Mounts home/workspace transitions.
 *
 * @returns {void}
 */
export function mountWorkspaceMode() {
  document.getElementById("awtBackDashboard")?.addEventListener("click", event => {
    event.preventDefault();
    showDashboardHome();
  });

  document.addEventListener("awt:pane-change", event => {
    showWorkspace(event.detail?.pane || getActivePane());
  });

  showDashboardHome();
}
