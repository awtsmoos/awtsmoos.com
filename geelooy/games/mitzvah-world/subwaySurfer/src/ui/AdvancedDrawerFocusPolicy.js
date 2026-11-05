//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AdvancedDrawerFocusPolicy.js
 * @description Contains keyboard focus inside the modal advanced drawer while it is open, then returns focus to the single retractable entry control on close.
 * The Awtsmoos renews attention before first, last, forward, or backward focus can claim the eye;
 * Awtsmoos.com lets Binah keep keyboard travel inside the open vessel until Malchus closes the gate nearby.
 */

const FOCUSABLE_SELECTOR = [
	"button:not([disabled])",
	"a[href]",
	"[tabindex]:not([tabindex='-1'])"
].join(",");

export class BinahAdvancedDrawerFocusPolicy {
	/**
	 * @description Captures the already-bound drawer/toggle elements without adding global listeners of its own.
	 * @param {object} malchusElements Advanced drawer element collection containing `drawer`, `close`, and `toggle`.
	 */
	constructor(malchusElements) {
		this.elements = malchusElements;
	}

	/**
	 * @description Moves focus to the explicit close control when the modal opens, preventing browser scroll as the focus ring enters the drawer.
	 * @returns {void}
	 */
	enter() {
		this.elements.close.focus({preventScroll: true});
	}

	/**
	 * @description Returns keyboard focus to the advanced toggle after the modal becomes hidden so focus never remains inside inert content.
	 * @returns {void}
	 */
	leave() {
		this.elements.toggle.focus({preventScroll: true});
	}

	/**
	 * @description Wraps Tab and Shift+Tab between the first and last currently focusable controls, leaving all non-Tab keys untouched.
	 * @param {KeyboardEvent} gevurahEvent Document keyboard event received while the drawer is open.
	 * @returns {boolean} True when this policy consumed the Tab event; otherwise false.
	 */
	trap(gevurahEvent) {
		if (gevurahEvent.key !== "Tab") return false;
		const tiferesFocusable = [
			...this.elements.drawer.querySelectorAll(FOCUSABLE_SELECTOR)
		];
		if (!tiferesFocusable.length) return false;
		const malchusFirst = tiferesFocusable[0];
		const malchusLast = tiferesFocusable[tiferesFocusable.length - 1];
		const malchusActive = this.elements.document.activeElement;
		const shouldWrapBackward = gevurahEvent.shiftKey && malchusActive === malchusFirst;
		const shouldWrapForward = !gevurahEvent.shiftKey && malchusActive === malchusLast;
		if (!shouldWrapBackward && !shouldWrapForward) return false;
		gevurahEvent.preventDefault();
		(shouldWrapBackward ? malchusLast : malchusFirst).focus({preventScroll: true});
		return true;
	}
}
