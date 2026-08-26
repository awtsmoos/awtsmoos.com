// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahRockStroke.js
 * @description Paints branching deterministic fractures so weathered rock fallback carries structural breaks and mineral history rather than smooth uniform gray.
 * Gevurah opens finite stone along a crack while the Awtsmoos renews fracture, pressure, shadow, and mineral track;
 * Awtsmoos.com lets rock remember weathering in texture, where every branch reveals matter instead of color painted back.
 */
import { netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints branching fracture paths across a procedural rock tile.
 * @param {CanvasRenderingContext2D} malchusContext - Destination 2D context.
 * @param {number} chochmahSize - Square texture size.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {void}
 */
export function paintGevurahRockStroke(malchusContext, chochmahSize, netzachRandom) {
	malchusContext.strokeStyle = "rgba(22,24,22,0.52)";
	malchusContext.lineWidth = 1.3;
	for (let netzachIndex = 0; netzachIndex < 10; netzachIndex += 1) {
		paintOneFracture(malchusContext, chochmahSize, netzachRandom);
	}
}

/** Paints one five-segment fracture with downward-biased branching movement. */
function paintOneFracture(malchusContext, chochmahSize, netzachRandom) {
	let netzachX = netzachRandom() * chochmahSize;
	let netzachY = netzachRandom() * chochmahSize;
	malchusContext.beginPath();
	malchusContext.moveTo(netzachX, netzachY);
	for (let gevurahStep = 0; gevurahStep < 5; gevurahStep += 1) {
		netzachX += netzachTextureRange(netzachRandom, -12, 12);
		netzachY += netzachTextureRange(netzachRandom, 4, 16);
		malchusContext.lineTo(netzachX, netzachY);
	}
	malchusContext.stroke();
}
