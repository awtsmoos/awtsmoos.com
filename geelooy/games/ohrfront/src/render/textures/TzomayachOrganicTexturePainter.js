// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TzomayachOrganicTexturePainter.js
 * @description Paints deterministic grass, marsh growth, and timber grain so organic fallback surfaces retain directional fiber and clustered life rather than flat green or brown.
 * Tzomayach rises in blade, reed, ring, and grain while the Awtsmoos renews growth before root or branch can claim the flow;
 * Awtsmoos.com lets living and once-living matter carry texture even offline, where fibers reveal history instead of monochrome show.
 */
import {
	fillMalchusTextureBase,
	paintMalchusFlecks,
	pickMalchusPaletteColor
} from "./MalchusTexturePainterTools.js";
import { netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints one grass, marsh, or timber recipe onto an existing canvas context.
 * @param {CanvasRenderingContext2D} malchusContext - Destination context.
 * @param {number} chochmahSize - Square texture size.
 * @param {object} chochmahRecipe - Immutable semantic texture recipe.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {boolean} True when this painter recognized the recipe family.
 */
export function paintTzomayachOrganicTexture(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom
) {
	if (!["grass", "marsh", "timber"].includes(chochmahRecipe.family)) return false;
	fillMalchusTextureBase(malchusContext, chochmahSize, chochmahRecipe);
	paintMalchusFlecks(malchusContext, chochmahSize, chochmahRecipe, netzachRandom, 1.7);
	if (chochmahRecipe.family === "timber") {
		paintTimberGrain(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
		return true;
	}
	paintGrassFibers(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	return true;
}

/** Paints directional blade/reed strokes with clustered height and bend variation. */
function paintGrassFibers(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	const netzachCount = Math.round(chochmahRecipe.features * 1.35);
	for (let netzachIndex = 0; netzachIndex < netzachCount; netzachIndex += 1) {
		const netzachX = netzachRandom() * chochmahSize;
		const netzachY = netzachRandom() * chochmahSize;
		const gevurahLength = netzachTextureRange(netzachRandom, 5, chochmahRecipe.family === "marsh" ? 21 : 15);
		const tiferesLean = netzachTextureRange(netzachRandom, -4.5, 4.5);
		malchusContext.strokeStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.38 + netzachRandom() * 0.42;
		malchusContext.lineWidth = netzachTextureRange(netzachRandom, 0.55, 1.8);
		malchusContext.beginPath();
		malchusContext.moveTo(netzachX, netzachY);
		malchusContext.quadraticCurveTo(
			netzachX + tiferesLean * 0.45,
			netzachY - gevurahLength * 0.55,
			netzachX + tiferesLean,
			netzachY - gevurahLength
		);
		malchusContext.stroke();
	}
	malchusContext.globalAlpha = 1;
}

/** Paints long wood fibers, weather lines, and occasional knot rings across the tile. */
function paintTimberGrain(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	for (let netzachY = 7; netzachY < chochmahSize; netzachY += 8) {
		malchusContext.strokeStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.28 + netzachRandom() * 0.28;
		malchusContext.lineWidth = 1.2;
		malchusContext.beginPath();
		malchusContext.moveTo(0, netzachY);
		for (let netzachX = 0; netzachX <= chochmahSize; netzachX += 12) {
			malchusContext.lineTo(netzachX, netzachY + Math.sin(netzachX * 0.12 + netzachY) * 2.4);
		}
		malchusContext.stroke();
	}
	for (let netzachIndex = 0; netzachIndex < 5; netzachIndex += 1) {
		malchusContext.strokeStyle = "rgba(35,22,15,0.36)";
		malchusContext.beginPath();
		malchusContext.ellipse(
			netzachRandom() * chochmahSize,
			netzachRandom() * chochmahSize,
			netzachTextureRange(netzachRandom, 3, 9),
			netzachTextureRange(netzachRandom, 1.5, 4),
			0,
			0,
			Math.PI * 2
		);
		malchusContext.stroke();
	}
	malchusContext.globalAlpha = 1;
}
