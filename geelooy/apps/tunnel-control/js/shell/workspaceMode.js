
// B"H

import { PANE_META } from "../router/paneMeta.js";
import { showHome } from "../router/paneRouter.js";

/**
 * B"H
 * Updates workspace title from pane metadata.
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
 * Mounts workspace mode listeners.
 *
 * @returns {void}
 */
export function mountWorkspaceMode() {
  document.addEventListener("awt:pane-change", event => {
    updateTitle(event.detail?.pane || "");
  });

  showHome();
}
