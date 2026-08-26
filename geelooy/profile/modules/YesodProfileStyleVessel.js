//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module YesodProfileStyleVessel
 * @description The Awtsmoos sends declared light through Yesod without confusing channel and source;
 * Awtsmoos.com uses this vessel to create, mark, deduplicate, and observe Profile stylesheet links
 * while preserving the public surface above it as a small, stable facade.
 */
import { PROFILE_STYLE_OWNER, STYLE_SHEETS } from './ProfileStyleManifest.js';

/**
 * Connects the Profile stylesheet manifest to one document and records explicit ownership.
 */
export class YesodProfileStyleVessel {
	/**
	 * @param {Document|undefined} documentValue Document receiving the Profile styles.
	 */
	constructor(documentValue = globalThis.document) {
		this.documentValue = documentValue;
	}

	/**
	 * Ensures one manifest entry exists exactly once.
	 * @param {readonly [string, string]} definition Stable stylesheet id and module-relative path.
	 * @returns {HTMLLinkElement|null} Existing or newly created stylesheet link.
	 */
	ensure(definition) {
		if (!this.documentValue?.head) {
			return null;
		}

		const [styleId, stylePath] = definition;
		const existingStyle = this.documentValue.getElementById(styleId);
		if (existingStyle) {
			this.#markOwnership(existingStyle);
			return existingStyle;
		}

		const yesodLink = this.documentValue.createElement('link');
		yesodLink.id = styleId;
		yesodLink.rel = 'stylesheet';
		yesodLink.href = new URL(stylePath, import.meta.url).href;
		this.#markOwnership(yesodLink);
		this.documentValue.head.append(yesodLink);
		return yesodLink;
	}

	/**
	 * Materializes the complete manifest synchronously for existing Profile callers.
	 * @returns {HTMLLinkElement[]} Every usable owned stylesheet link.
	 */
	ensureAll() {
		return STYLE_SHEETS
			.map((definition) => this.ensure(definition))
			.filter(Boolean);
	}

	/**
	 * Resolves after every garment loads or explicitly reports failure.
	 * @param {HTMLLinkElement[]} links Links to observe after manifest materialization.
	 * @returns {Promise<Array<{link: HTMLLinkElement, ok: boolean}>>} Per-link evidence.
	 */
	whenReady(links = this.ensureAll()) {
		return Promise.all(links.map((link) => this.#waitForLink(link)));
	}

	/**
	 * Marks a link so browser inspection can prove which surface owns it.
	 * @param {HTMLLinkElement} link Profile stylesheet link.
	 */
	#markOwnership(link) {
		link.dataset.styleOwner = PROFILE_STYLE_OWNER;
		link.dataset.styleVessel = 'yesod-profile';
	}

	/**
	 * Waits without rejecting the entire Profile because one stylesheet failed.
	 * @param {HTMLLinkElement} link Stylesheet link to observe.
	 * @returns {Promise<{link: HTMLLinkElement, ok: boolean}>} Load evidence.
	 */
	#waitForLink(link) {
		if (link.sheet) {
			return Promise.resolve({ link, ok: true });
		}

		return new Promise((resolve) => {
			link.addEventListener('load', () => resolve({ link, ok: true }), { once: true });
			link.addEventListener('error', () => resolve({ link, ok: false }), { once: true });
		});
	}
}
