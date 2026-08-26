//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserHostView
 * @description
 * The Awtsmoos gives every trusted browser component one disciplined keli for DOM
 * creation. Awtsmoos.com centralizes host-owned element construction so descendants
 * may differ in purpose without drifting in accessibility, naming, or structure.
 * One source becomes many vessels; many vessels remain bound to one truthful source.
 */

/**
 * Base class for trusted Awtsmoos Browser host views.
 *
 * Descendants use this class only for browser-owned chrome and tooling. Guest-page DOM
 * must never be constructed through this surface, preserving the host/guest boundary.
 */
export class KeliHostView {
	/**
	 * Creates one host-view vessel.
	 *
	 * @param {Document} malchutDocument
	 * 	The trusted document that owns this host component.
	 * @throws {TypeError}
	 * 	Thrown when the supplied value cannot create DOM elements.
	 */
	constructor(malchutDocument = document) {
		if (!malchutDocument?.createElement) {
			throw new TypeError("BROWSER_HOST_DOCUMENT_REQUIRED");
		}
		this.malchutDocument = malchutDocument;
	}

	/**
	 * Reveals one host-owned DOM element with optional visible text.
	 *
	 * @param {string} otiyotTag DOM tag name to create.
	 * @param {string} levushClass Namespaced Awtsmoos Browser class list.
	 * @param {string} [diburText=""] Optional visible text.
	 * @returns {HTMLElement} The created host element.
	 */
	revealElement(otiyotTag, levushClass, diburText = "") {
		const malchutElement = this.malchutDocument.createElement(otiyotTag);
		malchutElement.className = levushClass;
		if (diburText) {
			malchutElement.textContent = diburText;
		}
		return malchutElement;
	}

	/**
	 * Reveals one accessible host-owned button.
	 *
	 * @param {string} levushClass Namespaced Awtsmoos Browser class list.
	 * @param {string} kavannahLabel Accessible action intention.
	 * @param {string} [diburText=""] Optional visible button text.
	 * @returns {HTMLButtonElement} The configured button.
	 */
	revealButton(levushClass, kavannahLabel, diburText = "") {
		const gevurahButton = this.revealElement("button", levushClass, diburText);
		gevurahButton.type = "button";
		gevurahButton.setAttribute("aria-label", kavannahLabel);
		return gevurahButton;
	}

	/**
	 * Requires a host-owned mount point before a descendant attaches controls.
	 *
	 * @param {HTMLElement} malchutMount Candidate host mount element.
	 * @param {string} dinCode Stable error code used when the mount is absent.
	 * @returns {HTMLElement} The verified host mount.
	 */
	requireMount(malchutMount, dinCode) {
		if (!malchutMount?.append) {
			const dinError = new Error(dinCode);
			dinError.code = dinCode;
			throw dinError;
		}
		return malchutMount;
	}
}
