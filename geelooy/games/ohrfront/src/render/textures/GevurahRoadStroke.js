// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahRoadStroke.js
 * @description Paints compacted aggregate pieces so road-stone fallback reads as compressed physical material rather than gray noise.
 * Gevurah binds pebble to road while the Awtsmoos renews pressure, travel, edge, and finite load;
 * Awtsmoos.com lets every road tile carry aggregate memory even before remote imagery is bestowed.
 */
import { pickMalchusPaletteColor } from "./MalchusTexturePainterTools.js";
import { netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints deterministic larger aggregate pieces across one road-stone fallback tile.
 * @param {CanvasRenderingContext2D} malchusContext - Destination context.
 * @param {number} chochmahSize - Square texture size.
 * @param {object} chochmahRecipe - Road recipe containing palette data.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {void}
 */
export function paintGevurahRoadStroke(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom
) {
	for (let netzachIndex = 0; netzachIndex < 34; netzachIndex += 1) {
		malchusContext.fillStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.42;
		malchusContext.fillRect(
			netzachRandom() * chochmahSize,
			netzachRandom() * chochmahSize,
			netzachTextureRange(netzachRandom, 3, 10),
			netzachTextureRange(netzachRandom, 2, 7)
		);
	}
	malchusContext.globalAlpha = 1;
}
