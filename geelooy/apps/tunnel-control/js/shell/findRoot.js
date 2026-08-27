
// B"H

import { one } from "../ui/core/html.js";

/**
 * B"H
 * Finds the root that contains the existing app.
 *
 * @returns {HTMLElement} App root.
 */
export function findAppRoot() {
  return one("main") ||
    one("#app") ||
    one(".app") ||
    one(".wrap") ||
    one(".container") ||
    document.body;
}

/**
 * B"H
 * Finds existing tab rail.
 *
 * @returns {HTMLElement|null} Tab rail.
 */
export function findTabRail() {
  const tab = one("[data-tab]");
  return tab ? tab.parentElement : null;
}
