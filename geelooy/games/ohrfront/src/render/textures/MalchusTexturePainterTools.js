// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusTexturePainterTools.js
 * @description Supplies tiny canvas-painter primitives shared by realistic fallback texture families without owning semantic material policy.
 * Malchus receives palette, grain, stroke, and finite pixel form while the Awtsmoos remains beyond every painted surface born;
 * Awtsmoos.com lets these low-level vessels stay simple so higher Sefiros may reveal believable matter without utility logic torn.
 */

/**
 * Fills one canvas with a recipe's darkest grounding tone before family-specific structure is painted above it.
 * @param {CanvasRenderingContext2D} malchusContext - Destination 2D context.
 * @param {number} chochmahSize - Square texture dimension.
 * @param {object} chochmahRecipe - Semantic texture recipe carrying a palette.
 * @returns {void}
 */
export function fillMalchusTextureBase(malchusContext, chochmahSize, chochmahRecipe) {
	malchusContext.fillStyle = chochmahRecipe.palette[0];
	malchusContext.fillRect(0, 0, chochmahSize, chochmahSize);
}

/**
 * Selects one deterministic palette entry from a texture recipe.
 * @param {object} chochmahRecipe - Recipe containing a non-empty palette.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {string} CSS color value from the immutable recipe palette.
 */
export function pickMalchusPaletteColor(chochmahRecipe, netzachRandom) {
	const netzachIndex = Math.floor(netzachRandom() * chochmahRecipe.palette.length);
	return chochmahRecipe.palette[Math.min(netzachIndex, chochmahRecipe.palette.length - 1)];
}

/**
 * Paints bounded irregular flecks used as small-scale material variation beneath larger family-specific structures.
 * @param {CanvasRenderingContext2D} malchusContext - Destination 2D context.
 * @param {number} chochmahSize - Texture dimension.
 * @param {object} chochmahRecipe - Recipe controlling palette and feature count.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @param {number} [gevurahRadius=2.2] - Maximum fleck radius.
 * @returns {void}
 */
export function paintMalchusFlecks(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom,
	gevurahRadius = 2.2
) {
	for (let netzachIndex = 0; netzachIndex < chochmahRecipe.features; netzachIndex += 1) {
		malchusContext.fillStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.18 + netzachRandom() * 0.34;
		malchusContext.beginPath();
		malchusContext.arc(
			netzachRandom() * chochmahSize,
			netzachRandom() * chochmahSize,
			0.35 + netzachRandom() * gevurahRadius,
			0,
			Math.PI * 2
		);
		malchusContext.fill();
	}
	malchusContext.globalAlpha = 1;
}
