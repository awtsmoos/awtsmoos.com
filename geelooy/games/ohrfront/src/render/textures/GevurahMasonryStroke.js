// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahMasonryStroke.js
 * @description Paints staggered mortar courses and weathered block variation so local masonry fallback reads as constructed stone rather than random noise.
 * Gevurah marks seam and course while the Awtsmoos renews wall, mortar, chip, and finite stone;
 * Awtsmoos.com lets masonry reveal how hands assembled it, even before remote photographs are known.
 */
import { pickMalchusPaletteColor } from "./MalchusTexturePainterTools.js";
import { netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints masonry course lines and offset block faces across one procedural fallback tile.
 * @param {CanvasRenderingContext2D} malchusContext - Destination 2D context.
 * @param {number} chochmahSize - Square texture size.
 * @param {object} chochmahRecipe - Masonry recipe carrying palette/weather data.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {void}
 */
export function paintGevurahMasonryStroke(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom
) {
	malchusContext.strokeStyle = "rgba(25,23,20,0.48)";
	malchusContext.lineWidth = 2;
	for (let netzachY = 18; netzachY < chochmahSize; netzachY += 22) {
		const gevurahCourseY = netzachY + netzachTextureRange(netzachRandom, -2, 2);
		malchusContext.beginPath();
		malchusContext.moveTo(0, gevurahCourseY);
		malchusContext.lineTo(chochmahSize, gevurahCourseY);
		malchusContext.stroke();
		paintCourseBlocks(malchusContext, chochmahSize, chochmahRecipe, netzachRandom, netzachY);
	}
	malchusContext.globalAlpha = 1;
}

/** Paints one staggered row of stone faces above a mortar course. */
function paintCourseBlocks(malchusContext, chochmahSize, chochmahRecipe, netzachRandom, netzachY) {
	const gevurahOffset = (Math.floor(netzachY / 22) % 2) * 20;
	for (let netzachX = gevurahOffset; netzachX < chochmahSize; netzachX += 40) {
		malchusContext.fillStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.22;
		malchusContext.fillRect(netzachX + 2, netzachY - 18, 35, 15);
	}
}
