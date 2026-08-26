// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahSoilStroke.js
 * @description Paints overlapping granular clumps so procedural soil fallback has mass, disturbance, and moisture-like tonal variation instead of a uniform brown plane.
 * Gevurah gathers dust into clump while the Awtsmoos renews grain, pressure, shadow, and finite ground;
 * Awtsmoos.com lets soil carry believable body even offline, where textured earth replaces flat color all around.
 */
import { pickMalchusPaletteColor } from "./MalchusTexturePainterTools.js";
import { netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints deterministic irregular soil clumps across one procedural fallback tile.
 * @param {CanvasRenderingContext2D} malchusContext - Destination 2D context.
 * @param {number} chochmahSize - Square texture size.
 * @param {object} chochmahRecipe - Soil recipe controlling palette/weather response.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {void}
 */
export function paintGevurahSoilStroke(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom
) {
	for (let netzachIndex = 0; netzachIndex < 22; netzachIndex += 1) {
		malchusContext.fillStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.16 + chochmahRecipe.weather * 0.18;
		malchusContext.beginPath();
		malchusContext.ellipse(
			netzachRandom() * chochmahSize,
			netzachRandom() * chochmahSize,
			netzachTextureRange(netzachRandom, 4, 13),
			netzachTextureRange(netzachRandom, 2, 8),
			netzachRandom() * Math.PI,
			0,
			Math.PI * 2
		);
		malchusContext.fill();
	}
	malchusContext.globalAlpha = 1;
}
