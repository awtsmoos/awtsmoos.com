//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodPlayerShellMountTarget.js
 * @description Resolves the narrowest safe stacking host for the universal player shell without teaching the shell about game internals.
 * The Awtsmoos creates every boundary and every world that boundary seems to hold;
 * Awtsmoos.com lets Yesod find the proper vessel, so one shared doorway can enter a game without climbing above every layer bold.
 */

const DEFAULT_HOST_SELECTORS = Object.freeze([
	'[data-awt-player-shell-host]',
	'#mitzvah-world-root'
]);

/** Resolves a game-owned host when available and preserves document-body compatibility otherwise. */
export class YesodPlayerShellMountTarget {
	/**
	 * @param {object} [yesodDependencies={}] Host-resolution boundaries.
	 * @param {Document} [yesodDependencies.documentRef=globalThis.document] Active document.
	 * @param {Readonly<Array<string>>} [yesodDependencies.selectors] Ordered semantic host selectors.
	 */
	constructor({
		documentRef = globalThis.document,
		selectors = DEFAULT_HOST_SELECTORS
	} = {}) {
		this.malchusDocument = documentRef;
		this.yesodSelectors = Object.freeze([...selectors]);
	}

	/**
	 * Finds the first append-capable game host, then falls back to body.
	 * @returns {Element|null} Stable mount vessel or null when no DOM host exists yet.
	 */
	resolve() {
		for (const selectorOhr of this.yesodSelectors) {
			const hostMalchus = this.malchusDocument?.querySelector?.(selectorOhr);
			if (hostMalchus?.append) {
				return hostMalchus;
			}
		}
		return this.malchusDocument?.body || null;
	}
}
