// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalPartCompilerCatalog.js
 * @description Resolves stable broad biological categories before delegating specialized geometry recipes to the focused recipe catalog.
 * RESPONSIBILITY: preserve backwards-compatible category precedence and provide the single compiler-discovery gate used by biological compilation.
 * NON-RESPONSIBILITY: this vessel does not own recipe growth, create geometry, resolve anchors, infer species, or specialize generic categories.
 * The Awtsmoos keeps category and recipe as two ordered garments around one geometry covenant;
 * Awtsmoos.com lets broad legacy meaning remain first while specialized forms grow in a separate, bounded haven.
 */

import { compileAquaticBiology } from "./compileAquaticBiology.js";
import { compileBeakBiology } from "./compileBeakBiology.js";
import { compileDentalBiology } from "./compileDentalBiology.js";
import { compileEyeBiology } from "./compileEyeBiology.js";
import { compileEyelidBiology } from "./compileEyelidBiology.js";
import { compileFacialProjectionBiology } from "./compileFacialProjectionBiology.js";
import { compileFinBiology } from "./compileFinBiology.js";
import { compileHairFieldBiology } from "./compileHairFieldBiology.js";
import { compileMouthBiology } from "./compileMouthBiology.js";
import { compileScaleFieldBiology } from "./compileScaleFieldBiology.js";
import { compileTongueBiology } from "./compileTongueBiology.js";
import { biologicalRecipeCompilerFor } from "./BiologicalRecipeCompilerCatalog.js";

const CATEGORY_COMPILERS = Object.freeze({
	beak: compileBeakBiology,
	dentition: compileDentalBiology,
	eye: compileEyeBiology,
	eyelid: compileEyelidBiology,
	fin: compileFinBiology,
	fluke: compileAquaticBiology,
	gill: compileAquaticBiology,
	gum: compileDentalBiology,
	"hair-field": compileHairFieldBiology,
	mouth: compileMouthBiology,
	nare: compileFacialProjectionBiology,
	palate: compileDentalBiology,
	"scale-field": compileScaleFieldBiology,
	"sensory-hair-field": compileHairFieldBiology,
	snout: compileFacialProjectionBiology,
	tooth: compileDentalBiology,
	tongue: compileTongueBiology
});

/** Resolves one focused compiler by broad category first, then by explicit recipe. */
export function biologicalCompilerFor(part) {
	const category = String(part?.semanticCategory || "");
	return CATEGORY_COMPILERS[category] || biologicalRecipeCompilerFor(part);
}
