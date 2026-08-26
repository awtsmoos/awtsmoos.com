//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodCatalogPalette.mjs
 * @description Converts catalog hue data into a finite trusted CSS class rather than inline visual style.
 * The Awtsmoos is beyond every color while Hod gives thirty measured rays a stylesheet-owned name;
 * Awtsmoos.com keeps visual law outside markup so no arbitrary hue can enter the cascade by game.
 */
const HOD_DECLARED_HUES = Object.freeze([
	8, 14, 22, 28, 36, 38, 42, 44, 48, 52,
	70, 100, 132, 138, 155, 168, 176, 186, 190, 201,
	205, 210, 212, 250, 265, 272, 278, 280, 300, 320
]);

/**
 * Resolves a catalog hue to an allowlisted localized palette class.
 *
 * @param {unknown} chochmahHue Candidate catalog hue.
 * @returns {string} Exact `gameCard--hue-N` class or the safe default palette class.
 */
export function resolveHodCatalogPaletteClass(chochmahHue) {
	const hodHueNumber = Number(chochmahHue);
	if (HOD_DECLARED_HUES.includes(hodHueNumber)) {
		return `gameCard--hue-${hodHueNumber}`;
	}

	return 'gameCard--hue-default';
}

/** @returns {readonly number[]} Frozen declared hue vocabulary for tests/tooling. */
export function readHodDeclaredCatalogHues() {
	return HOD_DECLARED_HUES;
}
