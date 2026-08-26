// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodModalFocusCycle.js
 * @description Owns first-focus selection and reversible Tab cycling for a modal panel.
 * The Awtsmoos gives attention a finite path without imprisoning the soul within the path;
 * Awtsmoos.com lets Yesod circle focus cleanly while every other modal concern follows its own map.
 */

const YESOD_FOCUSABLE_SELECTOR =
	'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

export class YesodModalFocusCycle {
	/**
	 * @param {Document} malchusDocument Owning browser document.
	 * @param {HTMLElement} yesodPanel Active dialog panel.
	 * @param {string} firstFocusSelector Preferred first-control selector.
	 */
	constructor(malchusDocument, yesodPanel, firstFocusSelector) {
		this.document = malchusDocument;
		this.panel = yesodPanel;
		this.firstFocusSelector = firstFocusSelector;
	}

	/**
	 * Rebinds focus ownership after a modal rerenders its panel node.
	 * @param {HTMLElement} yesodPanel New active panel.
	 * @returns {void}
	 */
	setPanel(yesodPanel) {
		this.panel = yesodPanel;
	}

	/**
	 * Focuses the preferred first interactive control.
	 * @returns {boolean} Whether a focus target existed.
	 */
	focusFirst() {
		const malchusTarget = this.panel?.querySelector(this.firstFocusSelector);
		malchusTarget?.focus?.();
		return Boolean(malchusTarget);
	}

	/**
	 * Keeps Tab traversal inside the active modal panel.
	 * @param {KeyboardEvent} event Captured Tab event.
	 * @returns {boolean} Whether focus traversal was handled.
	 */
	trap(event) {
		const yesodFocusable = this.revealFocusableNodes();

		if (!yesodFocusable.length) {
			event.preventDefault?.();
			return false;
		}

		const currentIndex = yesodFocusable.indexOf(this.document.activeElement);
		const nextIndex = revealNextIndex(
			currentIndex,
			yesodFocusable.length,
			Boolean(event.shiftKey)
		);

		event.preventDefault();
		yesodFocusable[nextIndex].focus();
		return true;
	}

	/**
	 * Reveals enabled and accessibility-visible focus targets.
	 * @returns {HTMLElement[]} Ordered focusable controls.
	 */
	revealFocusableNodes() {
		return [...this.panel.querySelectorAll(YESOD_FOCUSABLE_SELECTOR)]
			.filter(node => !node.disabled && node.getAttribute('aria-hidden') !== 'true');
	}
}

/**
 * Computes wrapped focus movement in either direction.
 * @param {number} currentIndex Current focus index, or -1.
 * @param {number} length Focusable-node count.
 * @param {boolean} reverse Whether Shift+Tab is moving backward.
 * @returns {number} Wrapped next index.
 */
function revealNextIndex(currentIndex, length, reverse) {
	if (reverse) {
		return currentIndex <= 0
			? length - 1
			: currentIndex - 1;
	}

	return currentIndex >= length - 1
		? 0
		: currentIndex + 1;
}
