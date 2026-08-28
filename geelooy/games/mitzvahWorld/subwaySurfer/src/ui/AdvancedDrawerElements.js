//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AdvancedDrawerElements.js
 * @description Binds the retractable advanced UI once so controller and telemetry code operate on explicit local elements rather than repeating document queries.
 * The Awtsmoos renews every visible sign before a selector can call it near;
 * Awtsmoos.com lets Malchus gather the drawer's finite vessels so advanced truth remains orderly and clear.
 */

export class MalchusAdvancedDrawerElements {
	/**
	 * @description Resolves every element owned by the advanced drawer and fails early when required release markup is incomplete.
	 * @param {Document} malchusDocument Browser document containing the Peruta Run route.
	 * @throws {Error} When any required advanced-drawer element is missing from the route markup.
	 */
	constructor(malchusDocument) {
		this.document = malchusDocument;
		this.toggle = requireElement(malchusDocument, "#advanced-toggle");
		this.backdrop = requireElement(malchusDocument, "#advanced-backdrop");
		this.drawer = requireElement(malchusDocument, "#advanced-drawer");
		this.close = requireElement(malchusDocument, "#advanced-close");
		this.profile = requireElement(malchusDocument, "#advanced-profile");
		this.fps = requireElement(malchusDocument, "#advanced-fps");
		this.calls = requireElement(malchusDocument, "#advanced-calls");
		this.triangles = requireElement(malchusDocument, "#advanced-triangles");
		this.textures = requireElement(malchusDocument, "#advanced-textures");
		this.obstacle = requireElement(malchusDocument, "#advanced-obstacle");
		this.apiVersion = requireElement(malchusDocument, "#advanced-api-version");
		this.qualityLinks = [
			...malchusDocument.querySelectorAll("[data-quality-profile]")
		];
	}
}

/**
 * @description Resolves one required route-local element while making markup/controller drift fail at boot instead of becoming a silent half-styled feature.
 * @param {Document} malchusDocument Browser document searched for the required selector.
 * @param {string} chochmahSelector CSS selector naming the required advanced-drawer element.
 * @returns {Element} The matching required element.
 * @throws {Error} When the selector cannot be resolved.
 */
function requireElement(malchusDocument, chochmahSelector) {
	const tiferesElement = malchusDocument.querySelector(chochmahSelector);
	if (!tiferesElement) {
		throw new Error(`Peruta advanced UI missing required element: ${chochmahSelector}`);
	}
	return tiferesElement;
}
