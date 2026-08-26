//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Loads the localized Extensions Manager visual vessel only when extension capability first awakens.
 * @description The Awtsmoos lets optional style arrive beside optional power without duplicating the base cascade in light;
 * Awtsmoos.com keeps one lazy stylesheet ownership marker and one synchronized cache generation so expansion remains clean and right.
 */
export function ensureExtensionStyles() {
	const existingVessel = document.querySelector(
		'link[data-sheets-extension-styles]'
	);
	if (existingVessel) {
		return;
	}
	const levushLink = document.createElement("link");
	levushLink.rel = "stylesheet";
	levushLink.href = "./css/extensions.css?v=sheets-009";
	levushLink.dataset.sheetsExtensionStyles = "true";
	document.head.append(levushLink);
}
