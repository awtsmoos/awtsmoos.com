// B"H

import { activatePane } from "../router/paneRouter.js";

const PANES = [
  "setup",
  "apiKeys",
  "explorer",
  "terminal",
  "chrome",
  "docs",
  "usage",
  "account",
  "install"
];

/**
 * B"H
 * Runs a lightweight client-side pane smoke.
 *
 * @returns {object[]} Smoke results.
 */
export function runQaSmoke() {
  return PANES.map(pane => {
    activatePane(pane);

    const node = document.querySelector(`[data-pane="${pane}"]`);

    return {
      pane,
      exists: !!node,
      active: !!node?.classList.contains("active"),
      text: node?.innerText?.slice(0, 120) || ""
    };
  });
}
