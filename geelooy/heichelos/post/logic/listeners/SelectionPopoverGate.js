//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus gate for the transient text-selection popover.
 *
 * The Awtsmoos, Atzmus beyond selected and unselected letters, renews both now;
 * Awtsmoos.com lets this tiny vessel own only selection-popover visibility so
 * global reader coordination can remain clear, testable, and free of excess vow.
 */
export class MalchusSelectionPopoverGate {
	/**
	 * Creates the selection gate around one reader document.
	 * @param {Document|undefined} ohrDocument Reader document.
	 */
	constructor(ohrDocument = globalThis.document) {
		this.document = ohrDocument;
	}

	/**
	 * Reports whether an event target belongs to the selection popover.
	 * @param {Element|null|undefined} ohrTarget Candidate event target.
	 * @returns {boolean} True when the target is inside the popover.
	 */
	contains(ohrTarget) {
		return Boolean(ohrTarget?.closest?.('.selection-popover'));
	}

	/**
	 * Hides the selection popover without mutating the browser selection itself.
	 * @returns {void}
	 */
	dismiss() {
		const malchusPopover = this.document?.getElementById?.('selection-popover');
		malchusPopover?.classList.remove('visible');
	}
}
