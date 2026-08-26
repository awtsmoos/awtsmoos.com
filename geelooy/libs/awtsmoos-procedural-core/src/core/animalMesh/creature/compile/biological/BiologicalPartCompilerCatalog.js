// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalPartCompilerCatalog.js
 * @description Maps stable biological categories and geometry recipes to the focused compilers that already own their shapes.
 * RESPONSIBILITY: centralize semantic compiler discovery while preserving safe category precedence over explicit recipe aliases.
 * NON-RESPONSIBILITY: this catalog does not create geometry, resolve anchors, own species presets, or guess narrow morphology from an overly broad category.
 * The Awtsmoos renews eye, tongue, hoof, scale, gill, hand, nose, ears, dewlap, udder, soft appendage, and fin through distinct vessels while remaining One;
 * Awtsmoos.com lets one quiet catalog remember each lawful gate, yet Gevurah keeps broad names from stealing a specialized form they were never meant to own.
 */

import { compileAquaticBiology } from "./compileAquaticBiology.js";
import { compileBeakBiology } from "./compileBeakBiology.js";
import { compileDentalBiology } from "./compileDentalBiology.js";
import { compileDewlapBiology } from "./compileDewlapBiology.js";
import { compileEyeBiology } from "./compileEyeBiology.js";
import { compileEyelidBiology } from "./compileEyelidBiology.js";
import { compileFacialProjectionBiology } from "./compileFacialProjectionBiology.js";
import { compileFinBiology } from "./compileFinBiology.js";
import { compileHairFieldBiology } from "./compileHairFieldBiology.js";
import { compileHoofBiology } from "./compileHoofBiology.js";
import { compileHumanEarBiology } from "./compileHumanEarBiology.js";
import { compileHumanFootBiology } from "./compileHumanFootBiology.js";
import { compileHumanHandBiology } from "./compileHumanHandBiology.js";
import { compileMouthBiology } from "./compileMouthBiology.js";
import { compileRuminantEarBiology } from "./compileRuminantEarBiology.js";
import { compileScaleFieldBiology } from "./compileScaleFieldBiology.js";
import { compileSoftAppendageBiology } from "./compileSoftAppendageBiology.js";
import { compileTongueBiology } from "./compileTongueBiology.js";
import { compileUdderBiology } from "./compileUdderBiology.js";

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

const RECIPE_COMPILERS = Object.freeze({
	"articulated-palm-digits": compileHumanHandBiology,
	"bilateral-fluke": compileAquaticBiology,
	"branching-gill-fronds": compileAquaticBiology,
	"conforming-surface-field": compileScaleFieldBiology,
	"dental-arch-array": compileDentalBiology,
	"flexible-tapered-tube": compileSoftAppendageBiology,
	"folded-ear-shell": compileHumanEarBiology,
	"forked-soft-tube": compileTongueBiology,
	"hanging-soft-tube": compileSoftAppendageBiology,
	"hanging-surface-loft": compileDewlapBiology,
	"human-foot-volume": compileHumanFootBiology,
	"human-nose-loft": compileFacialProjectionBiology,
	"inset-opening-pair": compileFacialProjectionBiology,
	"layered-eye": compileEyeBiology,
	"layered-gill-slit": compileAquaticBiology,
	"layered-mouth-cavity": compileMouthBiology,
	"lobed-soft-volume": compileUdderBiology,
	"muzzle-loft": compileFacialProjectionBiology,
	"oral-roof-surface": compileDentalBiology,
	"paired-beak-loft": compileBeakBiology,
	"paired-hoof-shell": compileHoofBiology,
	"ray-membrane-fin": compileFinBiology,
	"soft-dental-arch": compileDentalBiology,
	"soft-ear-shell": compileRuminantEarBiology,
	"soft-tapered-loft": compileTongueBiology,
	"stiff-strand-field": compileHairFieldBiology,
	"strand-field": compileHairFieldBiology,
	"strand-row": compileHairFieldBiology,
	"surface-line-field": compileAquaticBiology,
	"surface-ribbon": compileEyelidBiology,
	"tooth-crown-root": compileDentalBiology,
	"transverse-plate-field": compileScaleFieldBiology
});

/** Resolves one focused compiler by safely broad category before explicit recipe alias. */
export function biologicalCompilerFor(part) {
	const category = String(part?.semanticCategory || "");
	const recipe = String(part?.parameters?.biologicalGeometryRecipe || "");
	return CATEGORY_COMPILERS[category] || RECIPE_COMPILERS[recipe] || null;
}
