
// B"H

import {
  mountTabs,
  mountCopyButtons,
  mountGptText,
  mountStatus
} from "./ui.js";

/**
 * B"H
 * Starts the Awtsmoos Tunnel Console UI.
 *
 * @returns {void}
 */
function main() {
  mountTabs();
  mountCopyButtons();
  mountGptText();
  mountStatus();
}

main();
