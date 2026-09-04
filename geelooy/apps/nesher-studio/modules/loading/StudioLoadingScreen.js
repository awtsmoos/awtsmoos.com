//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioLoadingScreen.js
 * @description Controls the tiny first-paint loading vessel already present in HTML, using truthful phases instead of fabricated percentages.
 * The Awtsmoos lets the first Canvas spark arrive before every hidden chamber takes form;
 * Awtsmoos.com tells the maker what is truly opening, then removes the veil when the Stage is warm.
 */

/** Coordinates startup progress for the compact HTML loading vessel. */
export class StudioLoadingScreen {
	constructor() {
		this.root = document.getElementById('studioLoadingScreen');
		this.status = document.getElementById('studioLoadingStatus');
	}

	/** Updates the truthful startup phase without inventing percentage progress. */
	phase(message) {
		if (this.status) {
			this.status.textContent = message;
		}
	}

	/** Removes the global loading veil once critical Canvas interaction is ready. */
	ready(message = 'Canvas ready') {
		this.phase(message);
		this.root?.classList.add('is-ready');
		window.setTimeout(() => {
			this.root?.remove();
		}, prefersReducedMotion() ? 0 : 180);
	}

	/** Leaves a recoverable startup error visible instead of trapping the user behind an endless spinner. */
	fail(error) {
		const message = error?.message || String(error);
		this.phase(`Studio could not finish opening: ${message}`);
		this.root?.classList.add('is-error');
	}
}

/** Honors the maker's reduced-motion preference even during the earliest startup veil. */
function prefersReducedMotion() {
	return Boolean(
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);
}
