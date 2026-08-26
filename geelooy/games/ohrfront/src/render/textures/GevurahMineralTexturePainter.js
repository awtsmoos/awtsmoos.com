// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahMineralTexturePainter.js
 * @description Paints deterministic soil, rock, masonry, and road-stone fallback textures with physically legible granular, fractured, and coursed structure.
 * Gevurah gives matter fracture, seam, weight, and weather while the Awtsmoos remains beyond stone, dust, road, and wall;
 * Awtsmoos.com lets these fallback surfaces carry believable history so no mineral mesh survives as a naked color at all.
 */
import {
	fillMalchusTextureBase,
	paintMalchusFlecks,
	pickMalchusPaletteColor
} from "./MalchusTexturePainterTools.js";
import { netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints one mineral/constructed recipe onto an existing square canvas context.
 * @param {CanvasRenderingContext2D} malchusContext - Destination canvas context.
 * @param {number} chochmahSize - Square texture size.
 * @param {object} chochmahRecipe - Semantic recipe with family, palette, feature count, and weather.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {boolean} True when this painter recognized and painted the recipe family.
 */
export function paintGevurahMineralTexture(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom
) {
	if (!["soil", "rock", "masonry", "road"].includes(chochmahRecipe.family)) return false;
	fillMalchusTextureBase(malchusContext, chochmahSize, chochmahRecipe);
	paintMalchusFlecks(malchusContext, chochmahSize, chochmahRecipe, netzachRandom, 3.4);
	if (chochmahRecipe.family === "masonry") paintMasonryCourses(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	if (chochmahRecipe.family === "rock") paintRockFractures(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	if (chochmahRecipe.family === "road") paintRoadAggregate(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	if (chochmahRecipe.family === "soil") paintSoilClumps(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	return true;
}

/** Paints staggered mortar courses so masonry reads as constructed material rather than random stone noise. */
function paintMasonryCourses(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	malchusContext.strokeStyle = "rgba(25,23,20,0.48)";
	malchusContext.lineWidth = 2;
	for (let netzachY = 18; netzachY < chochmahSize; netzachY += 22) {
		malchusContext.beginPath();
		malchusContext.moveTo(0, netzachY + netzachTextureRange(netzachRandom, -2, 2));
		malchusContext.lineTo(chochmahSize, netzachY + netzachTextureRange(netzachRandom, -2, 2));
		malchusContext.stroke();
		const gevurahOffset = (Math.floor(netzachY / 22) % 2) * 20;
		for (let netzachX = gevurahOffset; netzachX < chochmahSize; netzachX += 40) {
			malchusContext.fillStyle = pickMalchusPaletteColor(chochmahRecipe, netzachRandom);
			malchusContext.globalAlpha = 0.22;
			malchusContext.fillRect(netzachX + 2, netzachY - 18, 35, 15);
		}
	}
	malchusContext.globalAlpha = 1;
}

/** Paints branching fracture strokes characteristic of exposed weathered rock. */
function paintRockFractures(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	malchusContext.strokeStyle = "rgba(22,24,22,0.52)";
	malchusContext.lineWidth = 1.3;
	for (let netzachIndex = 0; netzachIndex < 10; netzachIndex += 1) {
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
}

/** Paints larger embedded aggregate pieces that make road stone read compacted rather than merely speckled. */
function paintRoadAggregate(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
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

/** Paints soft overlapping clumps so earth carries granular mass instead of uniform brown fill. */
function paintSoilClumps(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
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
