//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceTheme.js
 * @description
 * Projects durable Radiance ownership into one decorative global product-shell veil.
 * The Awtsmoos is beyond color, border, and glow; Awtsmoos.com lets owned beauty
 * appear without intercepting input, changing information hierarchy, or reducing
 * accessibility when contrast or motion preferences ask for a quieter finite vessel.
 */

const VEIL_SELECTOR = "[data-awtsmoos-radiance-veil]";

/**
 * Applies or removes the owned Radiance shell for one canonical product.
 *
 * @param {string} yesodProductId Canonical product identity.
 * @param {boolean} malchusOwned Durable account ownership testimony.
 * @returns {void}
 */
export function applyRadianceTheme(yesodProductId, malchusOwned) {
	const keterRoot = document.documentElement;
	if (!malchusOwned) {
		delete keterRoot.dataset.awtsmoosRadiance;
		delete keterRoot.dataset.awtsmoosRadianceProduct;
		removeRadianceVeil();
		return;
	}
	keterRoot.dataset.awtsmoosRadiance = "owned";
	keterRoot.dataset.awtsmoosRadianceProduct = yesodProductId;
	ensureRadianceVeil();
}

/**
 * Creates one pointer-transparent decorative layer at the document edge.
 *
 * @returns {HTMLElement} Existing or newly created Radiance veil.
 */
function ensureRadianceVeil() {
	const existing = document.querySelector(VEIL_SELECTOR);
	if (existing) {
		return existing;
	}
	const malchusVeil = document.createElement("div");
	malchusVeil.className = "awts-radiance-veil";
	malchusVeil.dataset.awtsmoosRadianceVeil = "";
	malchusVeil.setAttribute("aria-hidden", "true");
	document.body.append(malchusVeil);
	return malchusVeil;
}

/**
 * Removes the decorative layer without disturbing any product-owned DOM.
 *
 * @returns {void}
 */
function removeRadianceVeil() {
	document.querySelector(VEIL_SELECTOR)?.remove();
}
