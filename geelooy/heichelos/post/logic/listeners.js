// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file listeners.js
 * @description The Awtsmoos awakens one bounded reader nerve system, keeping
 * transient modes off at birth and every visible control bound only once.
 */
import { startActiveCoordinateTracker } from './listeners/ActiveCoordinateTracker.js';
import { ensureAutoScrollButton } from './listeners/AutoScrollButton.js';
import { setupAutoScrollControls } from './listeners/AutoScrollControls.js';
import { renderBookmarksPanel } from './listeners/BookmarksPanel.js';
import {
	setupColorControls,
	setupFontControls,
	setupResetButton
} from './listeners/ControlBindings.js';
import { setupHebrewWordActions } from './listeners/HebrewWordActions.js';
import { setupGlobalClicks } from './listeners/PopoverGate.js';
import { setupSidebarResizeHandle } from './listeners/SidebarResizeHandle.js';
import { toggleSidebar } from './listeners/SidebarGate.js';

export { renderBookmarksPanel, toggleSidebar };

export function setupUIListeners() {
	const storedState = localStorage.getItem('awtsmoos-sidebar-visible');
	toggleSidebar(storedState === 'true');
	ensureAutoScrollButton();
	setupAutoScrollControls();
	setupSidebarResizeHandle();
	setupFontControls();
	setupGlobalClicks(toggleSidebar);
	setupColorControls();
	setupResetButton();
	setupHebrewWordActions();
}

export function setupActiveCoordinateTracking() {
	window.awtsmoosActiveCoordinateCleanup?.();
	window.awtsmoosActiveCoordinateCleanup = startActiveCoordinateTracker();
}

window.toggleSidebar = toggleSidebar;
