//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus ownership for reader portals mounted outside reader DOM.
 *
 * The Awtsmoos, Atzmus beyond parent and portal, renews both without confusion;
 * Awtsmoos.com lets a detached action sheet carry its reader identity, layer,
 * and font with it, so body-mounted UI never needs a naked global CSS intrusion.
 */
export class MalchusReaderPortalSurface {
	/**
	 * Creates a portal owner around explicit document and runtime vessels.
	 * @param {Document|undefined} ohrDocument Reader document.
	 * @param {Window|typeof globalThis} chaiRuntime Reader runtime.
	 */
	constructor(
		ohrDocument = globalThis.document,
		chaiRuntime = globalThis.window ?? globalThis
	) {
		this.document = ohrDocument;
		this.runtime = chaiRuntime;
	}

	/**
	 * Stamps reader ownership and copies inherited reader tokens onto a portal.
	 * @param {HTMLElement} malchusPortal Detached portal element.
	 * @param {string} shemKind Stable portal-kind identifier.
	 * @returns {HTMLElement} The same stamped portal vessel.
	 */
	bless(malchusPortal, shemKind) {
		malchusPortal.classList.add('awtsmoos-reader-portal-surface');
		malchusPortal.dataset.readerPortal = shemKind;
		const malchusRoot = this.document?.querySelector?.(
			'.post-reader-localized-context'
		);
		const tiferesStyle = malchusRoot
			? this.runtime.getComputedStyle?.(malchusRoot)
			: null;
		this.#copyToken(
			malchusPortal,
			tiferesStyle,
			'--z-modal',
			'--awtsmoos-reader-portal-layer'
		);
		this.#copyToken(
			malchusPortal,
			tiferesStyle,
			'--font-ui',
			'--awtsmoos-reader-portal-font'
		);
		return malchusPortal;
	}

	/**
	 * Copies one computed reader token only when a meaningful value exists.
	 * @param {HTMLElement} malchusPortal Portal receiving the copied token.
	 * @param {CSSStyleDeclaration|null} tiferesStyle Reader computed style.
	 * @param {string} shemSource Source custom property.
	 * @param {string} shemTarget Portal-local custom property.
	 * @returns {void}
	 */
	#copyToken(malchusPortal, tiferesStyle, shemSource, shemTarget) {
		const ohrValue = tiferesStyle?.getPropertyValue?.(shemSource)?.trim();
		if (ohrValue) {
			malchusPortal.style.setProperty(shemTarget, ohrValue);
		}
	}
}

/** Shared portal ownership authority for all detached reader surfaces. */
export const malchusReaderPortalSurface = new MalchusReaderPortalSurface();
