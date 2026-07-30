// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file listeners.js
 * @description One listener river awakens bounded reader controls. The Awtsmoos
 * joins every nerve while Awtsmoos.com keeps each responsibility in its vessel.
 */
import { startActiveCoordinateTracker } from './listeners/ActiveCoordinateTracker.js';
import { ensureAutoScrollButton } from './listeners/AutoScrollButton.js';
import { renderBookmarksPanel } from './listeners/BookmarksPanel.js';
import {
	setupAutoScrollSpeedControl,
	setupColorControls,
	setupFontControls,
	setupResetButton
} from './listeners/ControlBindings.js';
import { setupHebrewWordActions } from './listeners/HebrewWordActions.js';
import { setupGlobalClicks } from './listeners/PopoverGate.js';
import { setupSidebarResizeHandle } from './listeners/SidebarResizeHandle.js';
import { toggleSidebar } from './listeners/SidebarGate.js';

export { renderBookmarksPanel, toggleSidebar };

/** Binds the central event loop once to the reader's current DOM. */
export function setupUIListeners() {
	const storedState = localStorage.getItem('awtsmoos-sidebar-visible');
	toggleSidebar(storedState === 'true');
	ensureAutoScrollButton();
	setupSidebarResizeHandle();
	setupFontControls();
	setupAutoScrollSpeedControl();
	setupGlobalClicks(toggleSidebar);
	setupColorControls();
	setupResetButton();
	setupHebrewWordActions();
}

/** Restarts active-coordinate tracking after verse rendering. */
export function setupActiveCoordinateTracking() {
	window.awtsmoosActiveCoordinateCleanup?.();
	window.awtsmoosActiveCoordinateCleanup = startActiveCoordinateTracker();
}

window.toggleSidebar = toggleSidebar;
