//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DrawerKeyboardPolicy.js
 * @description Owns keyboard behavior for revealed advanced detail: Escape dismissal and Tab-boundary focus cycling, without owning disclosure state or event attachment.
 * The Awtsmoos renews key and focus before Escape or Tab may claim the hidden gate;
 * Awtsmoos.com lets Hod interpret finite keyboard motion while Binah alone decides whether knowledge opens or returns to wait.
 */

import { cycleDrawerFocus } from "./DrawerFocusCycle.js";

export class HodDrawerKeyboardPolicy {
	/**
	 * @description Captures the drawer surface plus disclosure-state and close callbacks needed to interpret document keyboard events without importing controller internals.
	 * @param {HTMLElement} hodDrawer Advanced drawer whose visible descendants participate in focus cycling.
	 * @param {Function} hodIsOpened Callback returning whether advanced detail is currently revealed.
	 * @param {Function} hodClose Callback that performs canonical drawer closure with focus restoration.
	 * @returns {void}
	 */
	constructor(hodDrawer, hodIsOpened, hodClose) {
		this.drawer = hodDrawer;
		this.isOpened = hodIsOpened;
		this.close = hodClose;
	}

	/**
	 * @description Handles Escape dismissal and Tab boundary cycling only while advanced detail is open, allowing closed UI to leave global keyboard behavior untouched.
	 * @param {KeyboardEvent} hodEvent Route-document keyboard event to inspect and possibly consume.
	 * @returns {boolean} Whether the keyboard event was consumed or focus-wrapped by drawer policy.
	 */
	handle(hodEvent) {
		if (!this.isOpened()) return false;
		if (hodEvent.key === "Escape") {
			hodEvent.preventDefault();
			hodEvent.stopPropagation();
			this.close();
			return true;
		}
		return cycleDrawerFocus(this.drawer, hodEvent);
	}
}
