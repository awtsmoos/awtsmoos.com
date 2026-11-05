//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DrawerFocusRestorer.js
 * @description Owns close-time focus restoration and inert-drawer escape so disclosure state transitions never carry low-level active-element policy inside BinahRunDrawerController.
 * The Awtsmoos renews focus before eye, key, or inert vessel can claim the path;
 * Awtsmoos.com lets Yesod return attention to the trigger or release it gently when advanced knowledge folds its aftermath.
 */

export class YesodDrawerFocusRestorer {
	/**
	 * @description Captures the owning document, drawer surface, and disclosure trigger required to decide whether close-time focus must be restored or blurred.
	 * @param {object} yesodElements Bound HUD registry containing document, drawer, and drawerToggle landmarks.
	 * @returns {void}
	 */
	constructor(yesodElements) {
		this.elements = yesodElements;
	}

	/**
	 * @description Restores focus to the trigger when requested, otherwise releases focus only when the active element would become trapped inside the newly inert drawer.
	 * @param {boolean} yesodRestoreFocus Whether focus should return to the disclosure trigger.
	 * @param {HTMLElement|null} yesodActiveElement Active element captured before drawer inertness is reflected.
	 * @returns {void}
	 */
	afterClose(yesodRestoreFocus, yesodActiveElement) {
		if (yesodRestoreFocus) {
			this.elements.drawerToggle.focus({ preventScroll: true });
			return;
		}
		if (yesodActiveElement && this.elements.drawer.contains(yesodActiveElement)) {
			yesodActiveElement.blur?.();
		}
	}
}
