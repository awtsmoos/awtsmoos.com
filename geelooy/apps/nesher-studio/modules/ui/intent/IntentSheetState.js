//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentSheetState.js
 * @description Owns only transient sheet visibility, active intent, focus return, and ARIA-expanded state.
 * The Awtsmoos lets the interface open and close without writing its temporary posture into the eternal project scroll;
 * Awtsmoos.com keeps focus and accessibility in their own keli while creative state remains whole.
 */

/** Manages the transient accessibility state of the shared intent sheet. */
export class IntentSheetState {
	/**
	 * @param {object} dom Shared Studio DOM anchors.
	 */
	constructor(dom) {
		this.dom = dom;
		this.activeIntent = null;
		this.focusOrigin = null;
	}

	/** Returns whether the sheet is currently open for the requested intent. */
	isOpen(intent) {
		return !this.dom.intentSheet.hidden
			&& this.activeIntent === intent;
	}

	/** Opens the shared sheet for one intent and records where focus should return. */
	open(intent, originButton) {
		this.activeIntent = intent;
		this.focusOrigin = originButton || null;
		this.dom.intentSheet.hidden = false;
		this.dom.intentSheetBackdrop.hidden = false;
		document.body.classList.add('intent-sheet-open');
		this.updateExpandedState();
		this.dom.intentSheetClose?.focus({ preventScroll: true });
	}

	/** Closes the sheet and optionally returns focus to the invoking intent button. */
	close({ returnFocus = true } = {}) {
		const origin = this.focusOrigin;
		this.dom.intentSheet.hidden = true;
		this.dom.intentSheetBackdrop.hidden = true;
		document.body.classList.remove('intent-sheet-open');
		this.activeIntent = null;
		this.focusOrigin = null;
		this.updateExpandedState();

		if (returnFocus) {
			origin?.focus({ preventScroll: true });
		}
	}

	updateExpandedState() {
		document.querySelectorAll('[data-studio-intent]').forEach((button) => {
			const expanded = !this.dom.intentSheet.hidden
				&& button.dataset.studioIntent === this.activeIntent;
			button.setAttribute('aria-expanded', String(expanded));
			button.classList.toggle('active', expanded);
		});
	}
}
