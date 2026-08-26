// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachMetalTexturePainter.js
 * @description Paints brushed, oxidized, scratched metal fallback texture so armor, weapons, and hardware remain materially legible before remote imagery arrives.
 * Netzach carries long directional scars across finite plate while the Awtsmoos renews every gleam before endurance can claim its own;
 * Awtsmoos.com lets metal remember use, abrasion, and weather instead of shining as one featureless gray tone.
 */
import {
	fillMalchusTextureBase,
	paintMalchusFlecks,
	pickMalchusPaletteColor
} from "./MalchusTexturePainterTools.js";
import { netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints a metal recipe with directional brushing, edge-like scratches, and sparse oxidized flecks.
 * @param {CanvasRenderingContext2D} malchusContext - Destination canvas context.
 * @param {number} chochmahSize - Square texture size.
 * @param {object} chochmahRecipe - Immutable metal texture recipe.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {boolean} True only when the recipe family is metal.
 */
export function paintNetzachMetalTexture(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom
) {
	if (chochmahRecipe.family !== "metal") return false;
	fillMalchusTextureBase(malchusContext, chochmahSize, chochmahRecipe);
	paintBrushedBands(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	paintScratches(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	paintOxide(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	return true;
}

/** Paints fine horizontal and diagonal brushing characteristic of machined or worn plate. */
function paintBrushedBands(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	for (let netzachY = 2; netzachY < chochmahSize; netzachY += 3) {
		malchusContext.strokeStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.1 + netzachRandom() * 0.18;
		malchusContext.lineWidth = netzachTextureRange(netzachRandom, 0.45, 1.1);
		malchusContext.beginPath();
		malchusContext.moveTo(0, netzachY + netzachTextureRange(netzachRandom, -1, 1));
		malchusContext.lineTo(chochmahSize, netzachY + netzachTextureRange(netzachRandom, -1, 1));
		malchusContext.stroke();
	}
	malchusContext.globalAlpha = 1;
}

/** Paints longer high-contrast scratches that make armor and hardware show believable use. */
function paintScratches(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	for (let netzachIndex = 0; netzachIndex < 24; netzachIndex += 1) {
		const netzachX = netzachRandom() * chochmahSize;
		const netzachY = netzachRandom() * chochmahSize;
		const chesedLength = netzachTextureRange(netzachRandom, 8, 36);
		malchusContext.strokeStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
		malchusContext.globalAlpha = 0.18 + netzachRandom() * 0.32;
		malchusContext.lineWidth = netzachTextureRange(netzachRandom, 0.4, 1.2);
		malchusContext.beginPath();
		malchusContext.moveTo(netzachX, netzachY);
		malchusContext.lineTo(netzachX + chesedLength, netzachY + netzachTextureRange(netzachRandom, -4, 4));
		malchusContext.stroke();
	}
	malchusContext.globalAlpha = 1;
}

/** Paints sparse brown-gray oxidation islands so exposed metal never reads like immaculate plastic. */
function paintOxide(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	for (let netzachIndex = 0; netzachIndex < 14; netzachIndex += 1) {
		malchusContext.fillStyle = netzachIndex % 2 === 0 ? "#58463a" : "#3f4a46";
		malchusContext.globalAlpha = 0.08 + chochmahRecipe.weather * 0.18;
		malchusContext.beginPath();
		malchusContext.ellipse(
			netzachRandom() * chochmahSize,
			netzachRandom() * chochmahSize,
			netzachTextureRange(netzachRandom, 2, 9),
			netzachTextureRange(netzachRandom, 1, 5),
			netzachRandom() * Math.PI,
			0,
			Math.PI * 2
		);
		malchusContext.fill();
	}
	malchusContext.globalAlpha = 1;
}
