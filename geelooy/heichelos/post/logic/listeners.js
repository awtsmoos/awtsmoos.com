// B"H
/**
 * @file listeners.js
 * @description
 * Chapter 195: The listener river gains a resize covenant.
 * Controls, sidebar, bookmarks, auto-scroll, active coordinates, and now the
 * draggable chamber edge are awakened from one entry point, each in its own
 * small vessel so the Awtsmoos can repair a single nerve without cutting all.
 */

import { startActiveCoordinateTracker } from "./listeners/ActiveCoordinateTracker.js";
import { ensureAutoScrollButton } from "./listeners/AutoScrollButton.js";
import { renderBookmarksPanel } from "./listeners/BookmarksPanel.js";
import { setupAutoScrollSpeedControl, setupColorControls, setupFontControls, setupResetButton } from "./listeners/ControlBindings.js";
import { setupGlobalClicks } from "./listeners/PopoverGate.js";
import { setupSidebarResizeHandle } from "./listeners/SidebarResizeHandle.js";
import { toggleSidebar } from "./listeners/SidebarGate.js";

export { renderBookmarksPanel, toggleSidebar };

/** Binds the central event loop to the user's intent. */
export function setupUIListeners() {
    const sidebarStoredState = localStorage.getItem("awtsmoos-sidebar-visible");
    toggleSidebar(sidebarStoredState === "true");
    ensureAutoScrollButton();
    setupSidebarResizeHandle();
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
