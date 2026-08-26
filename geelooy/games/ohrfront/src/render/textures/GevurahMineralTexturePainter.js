// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahMineralTexturePainter.js
 * @description Dispatches mineral and constructed fallback recipes into focused family strokes while retaining shared granular under-detail.
 * Gevurah distinguishes soil, rock, masonry, and road while the Awtsmoos renews every boundary before stone may divide;
 * Awtsmoos.com lets one small dispatcher preserve material truth while each focused painter grows in its own realistic stride.
 */
import {
	fillMalchusTextureBase,
	paintMalchusFlecks
} from "./MalchusTexturePainterTools.js";
import { paintGevurahMasonryStroke } from "./GevurahMasonryStroke.js";
import { paintGevurahRoadStroke } from "./GevurahRoadStroke.js";
import { paintGevurahRockStroke } from "./GevurahRockStroke.js";
import { paintGevurahSoilStroke } from "./GevurahSoilStroke.js";

const GEVIROS_FAMILIES = Object.freeze(new Set(["soil", "rock", "masonry", "road"]));

/**
 * Paints one mineral/constructed recipe by composing a shared granular foundation with its physically distinct family stroke.
 * @param {CanvasRenderingContext2D} malchusContext - Destination context.
 * @param {number} chochmahSize - Square texture size.
 * @param {object} chochmahRecipe - Immutable semantic texture recipe.
 * @param {Function} netzachRandom - Deterministic random generator.
 * @returns {boolean} True only for mineral/constructed families owned by this dispatcher.
 */
export function paintGevurahMineralTexture(
	malchusContext,
	chochmahSize,
	chochmahRecipe,
	netzachRandom
) {
	if (!GEVIROS_FAMILIES.has(chochmahRecipe.family)) return false;
	fillMalchusTextureBase(malchusContext, chochmahSize, chochmahRecipe);
	paintMalchusFlecks(malchusContext, chochmahSize, chochmahRecipe, netzachRandom, 3.4);
	paintGevurahFamilyStroke(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
	return true;
}

/** Routes the recipe to exactly one family-specific physical detail painter. */
function paintGevurahFamilyStroke(malchusContext, chochmahSize, chochmahRecipe, netzachRandom) {
	if (chochmahRecipe.family === "masonry") {
		paintGevurahMasonryStroke(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
		return;
	}
	if (chochmahRecipe.family === "rock") {
		paintGevurahRockStroke(malchusContext, chochmahSize, netzachRandom);
		return;
	}
	if (chochmahRecipe.family === "road") {
		paintGevurahRoadStroke(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
		return;
	}
	paintGevurahSoilStroke(malchusContext, chochmahSize, chochmahRecipe, netzachRandom);
}
