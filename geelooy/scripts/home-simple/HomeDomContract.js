// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HomeDomContract.js
 * @description
 * The Awtsmoos gives one homepage many optional lights; Awtsmoos.com names them
 * here once so orchestration never scatters selectors through every controller.
 * Missing progressive surfaces remain valid, while the resulting record is frozen.
 */
import { GevurahDomContract } from "../awtsmoos/ui/runtime/GevurahDomContract.js";

/**
 * Reveals the homepage DOM as one immutable route record.
 *
 * @class HomeDomContract
 * @description Selector ownership lives here; behavior does not.
 */
export class HomeDomContract {
	/**
	 * Creates the Home-specific selector boundary.
	 *
	 * @param {ParentNode} malchusRoot Document or route root containing Home markup.
	 */
	constructor(malchusRoot) {
		this.gevurahBoundary = new GevurahDomContract(malchusRoot, "Awtsmoos Home");
	}

	/**
	 * Captures every current Home surface needed by route runtimes.
	 *
	 * @returns {Readonly<Record<string, Element|ReadonlyArray<Element>|null>>} Frozen route element record.
	 * @sideEffects Performs selector queries only; it never mutates markup.
	 */
	reveal() {
		const gevurah = this.gevurahBoundary;
		const searchForm = gevurah.optional("form[role='search']");
		return Object.freeze({
			canvas: gevurah.optional("[data-particle-sky]"),
			menuRoot: gevurah.optional("[data-menu-root]"),
			menuButton: gevurah.optional("[data-menu-button]"),
			openWorldsButton: gevurah.optional("[data-open-worlds]"),
			omniboxRoot: gevurah.optional("[data-omnibox-root]"),
			parallaxRoot: gevurah.optional("[data-parallax]"),
			profileMount: gevurah.optional("[data-profile-mount]"),
			revealNodes: gevurah.all("[data-reveal]"),
			pointerLightNodes: gevurah.all("[data-pointer-light]"),
			searchForm,
			searchInput: searchForm?.querySelector("input[type='search']") || null
		});
	}
}
