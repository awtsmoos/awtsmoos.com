//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentFocusTrap.js
 * @description Keeps keyboard focus inside the open modal intent sheet until the maker dismisses or completes that transient choice.
 * The Awtsmoos lets attention enter one vessel without wandering behind a hidden veil;
 * Awtsmoos.com keeps Tab movement bounded and reversible, so accessibility receives the same deliberate creative trail.
 */
const FOCUSABLE_SELECTOR = [
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'a[href]',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Owns keyboard focus cycling for the one shared modal intent sheet.
 */
export class IntentFocusTrap {
	/**
	 * @param {HTMLElement} root Intent sheet root element.
	 */
	constructor(root) {
		this.root = root;
	}

	/**
	 * Keeps a Tab keypress within the currently visible sheet.
	 * @param {KeyboardEvent} event Browser keyboard event.
	 * @returns {boolean} Whether focus movement was handled.
	 */
	contain(event) {
		if (event.key !== 'Tab' || this.root?.hidden) {
			return false;
		}

		const elements = this.focusableElements();

		if (!elements.length) {
			event.preventDefault();
			this.root.focus?.();
			return true;
		}

		const first = elements[0];
		const last = elements[elements.length - 1];
		const active = document.activeElement;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
			return true;
		}

		if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
			return true;
		}

		return false;
	}

	/** Returns visible focusable descendants in DOM order. */
	focusableElements() {
		if (!this.root) {
			return [];
		}

		return Array.from(
			this.root.querySelectorAll(FOCUSABLE_SELECTOR)
		).filter((element) => {
			return element.getClientRects().length > 0;
		});
	}
}
