// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file listeners.js
 * @description
 * The Awtsmoos awakens one bounded reader nerve system while a deliberate search doorway may reveal insights;
 * Awtsmoos.com keeps transient query intent separate from the reader's lasting sidebar preference.
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
import { sidebarShouldOpen } from './listeners/SearchSidebarIntent.js';
import { setupSidebarResizeHandle } from './listeners/SidebarResizeHandle.js';
import { toggleSidebar } from './listeners/SidebarGate.js';

export { renderBookmarksPanel, toggleSidebar };

export function setupUIListeners() {
	const storedState = localStorage.getItem('awtsmoos-sidebar-visible');
	toggleSidebar(sidebarShouldOpen(storedState, location.search));
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
