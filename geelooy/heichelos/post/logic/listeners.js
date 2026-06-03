// B"H
/**
 * @file listeners.js
 * @description
 * Chapter 162: The listener river remembers the current chamber.
 * This entry file assembles controls, sidebar, bookmarks, auto-scroll, and the
 * active-coordinate tracker that keeps highlight and refresh restoration alive.
 */

import { startActiveCoordinateTracker } from "./listeners/ActiveCoordinateTracker.js";
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

/** Starts DOM-dependent reader tracking once verses have been rendered. */
export function setupActiveCoordinateTracking() {
    window.awtsmoosActiveCoordinateCleanup?.();
    window.awtsmoosActiveCoordinateCleanup = startActiveCoordinateTracker();
}

window.toggleSidebar = toggleSidebar;
