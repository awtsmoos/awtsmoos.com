//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GevurahPlayerShellPanelState.js
 * @description Owns open/close truth, ARIA synchronization, help collapse, and focus policy for the shared menu.
 * The Awtsmoos is beyond concealment and revelation while Gevurah gives each finite state a bound;
 * Awtsmoos.com lets focus return with discipline so hidden depth never wanders around.
 */

/**
 * Stateful policy boundary for one mounted shell view.
 */
export class GevurahPlayerShellPanelState {
	/**
	 * @param {object} malchusViewContract Required shell DOM references.
	 * @param {HTMLButtonElement} malchusViewContract.launcherButton Retraction trigger.
	 * @param {HTMLElement} malchusViewContract.panelElement Retractable panel.
	 * @param {HTMLButtonElement} malchusViewContract.closeButton First focus target while open.
	 * @param {HTMLDetailsElement} malchusViewContract.helpDetails Optional help disclosure.
	 */
	constructor({ launcherButton, panelElement, closeButton, helpDetails }) {
		this.malchusLauncherButton = launcherButton;
		this.malchusPanelElement = panelElement;
		this.malchusCloseButton = closeButton;
		this.malchusHelpDetails = helpDetails;
	}

	/**
	 * Reports authoritative open state from the panel's native hidden property.
	 *
	 * @returns {boolean} True exactly when the panel is currently visible by state contract.
	 */
	isOpen() {
		return !this.malchusPanelElement.hidden;
	}

	/**
	 * Opens the panel, synchronizes ARIA, and moves keyboard focus into the menu.
	 *
	 * Side effects: mutates panel/launcher accessibility state and focuses the close button.
	 * @returns {void}
	 */
	open() {
		this.malchusPanelElement.hidden = false;
		this.malchusLauncherButton.setAttribute('aria-expanded', 'true');
		this.malchusCloseButton.focus();
	}

	/**
	 * Closes panel/help state and optionally restores focus to the launcher.
	 *
	 * @param {object} [gevurahOptions] Close policy.
	 * @param {boolean} [gevurahOptions.restoreFocus=true] Whether keyboard focus returns to the launcher.
	 * @returns {void}
	 */
	close({ restoreFocus = true } = {}) {
		this.malchusPanelElement.hidden = true;
		this.malchusLauncherButton.setAttribute('aria-expanded', 'false');
		this.malchusHelpDetails.open = false;

		if (restoreFocus) {
			this.malchusLauncherButton.focus();
		}
	}

	/**
	 * Toggles between disciplined open and close policies.
	 *
	 * @returns {boolean} Resulting open state after the transition.
	 */
	toggle() {
		if (this.isOpen()) {
			this.close();
			return false;
		}

		this.open();
		return true;
	}
}
