// B"H
/**
 * @file listeners.js
 * @description
 * Chapter 4: The listener monolith is shattered into bright chambers. This
 * entry file only assembles the gates: sidebar, popovers, controls, bookmarks,
 * and the green auto-scroll river.
 */

import { ensureAutoScrollButton } from "./listeners/AutoScrollButton.js";
import { renderBookmarksPanel } from "./listeners/BookmarksPanel.js";
import { setupColorControls, setupFontControls, setupResetButton } from "./listeners/ControlBindings.js";
import { setupGlobalClicks } from "./listeners/PopoverGate.js";
import { toggleSidebar } from "./listeners/SidebarGate.js";

export { renderBookmarksPanel, toggleSidebar };

/**
 * Binds the central event loop to the user's intent.
 * @returns {void}
 */
export function setupUIListeners() {
    const sidebarStoredState = localStorage.getItem("awtsmoos-sidebar-visible");
    toggleSidebar(sidebarStoredState === "true");
    ensureAutoScrollButton();
    setupFontControls();
    setupGlobalClicks(toggleSidebar);
    setupColorControls();
    setupResetButton();
}

window.toggleSidebar = toggleSidebar;
