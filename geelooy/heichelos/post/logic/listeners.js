// B"H
/**
 * @file listeners.js
 * @description
 * Chapter 148: The listener river gains a speed chamber.
 * This entry file only assembles the gates: sidebar, popovers, controls,
 * bookmarks, and the green auto-scroll river with its A-menu throttle.
 */

import { ensureAutoScrollButton } from "./listeners/AutoScrollButton.js";
import { renderBookmarksPanel } from "./listeners/BookmarksPanel.js";
import { setupAutoScrollSpeedControl, setupColorControls, setupFontControls, setupResetButton } from "./listeners/ControlBindings.js";
import { setupGlobalClicks } from "./listeners/PopoverGate.js";
import { toggleSidebar } from "./listeners/SidebarGate.js";

export { renderBookmarksPanel, toggleSidebar };

/** Binds the central event loop to the user's intent. */
export function setupUIListeners() {
    const sidebarStoredState = localStorage.getItem("awtsmoos-sidebar-visible");
    toggleSidebar(sidebarStoredState === "true");
    ensureAutoScrollButton();
    setupFontControls();
    setupAutoScrollSpeedControl();
    setupGlobalClicks(toggleSidebar);
    setupColorControls();
    setupResetButton();
}

window.toggleSidebar = toggleSidebar;
