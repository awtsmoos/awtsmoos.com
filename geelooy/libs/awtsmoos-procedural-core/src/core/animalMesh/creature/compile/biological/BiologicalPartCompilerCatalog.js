// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalPartCompilerCatalog.js
 * @description Maps stable biological categories and explicit geometry recipes to focused renderer-neutral geometry compilers.
 * RESPONSIBILITY: centralize compiler discovery while preserving broad legacy categories and recipe-level appendage specialization.
 * NON-RESPONSIBILITY: this catalog does not create geometry, resolve anchors, own species presets, or infer specialized shape from a broad biological name.
 * The Awtsmoos renews eye, tongue, fin, feather, sucker, tentacle, feeler, tail, spine, and soft display tissue through distinct vessels while remaining One;
 * Awtsmoos.com lets the catalog remember each lawful gate, while Gevurah keeps species and generic categories from stealing forms they do not own.
 */

import { compileAquaticBiology } from "./compileAquaticBiology.js";
import { compileBeakBiology } from "./compileBeakBiology.js";
import { compileCaudalFinBiology } from "./compileCaudalFinBiology.js";
import { compileDentalBiology } from "./compileDentalBiology.js";
import { compileDewlapBiology } from "./compileDewlapBiology.js";
import { compileEyeBiology } from "./compileEyeBiology.js";
import { compileEyelidBiology } from "./compileEyelidBiology.js";
import { compileFacialProjectionBiology } from "./compileFacialProjectionBiology.js";
import { compileFeatherBiology } from "./compileFeatherBiology.js";
import { compileFinBiology } from "./compileFinBiology.js";
import { compileHairFieldBiology } from "./compileHairFieldBiology.js";
import { compileHoofBiology } from "./compileHoofBiology.js";
import { compileHumanEarBiology } from "./compileHumanEarBiology.js";
import { compileHumanFootBiology } from "./compileHumanFootBiology.js";
import { compileHumanHandBiology } from "./compileHumanHandBiology.js";
import { compileKeratinSpikeBiology } from "./compileKeratinSpikeBiology.js";
import { compileMouthBiology } from "./compileMouthBiology.js";
import { compileRuminantEarBiology } from "./compileRuminantEarBiology.js";
import { compileScaleFieldBiology } from "./compileScaleFieldBiology.js";
import { compileSegmentedAppendageBiology } from "./compileSegmentedAppendageBiology.js";
import { compileSoftAppendageBiology } from "./compileSoftAppendageBiology.js";
import { compileSoftLobeBiology } from "./compileSoftLobeBiology.js";
import { compileSoftNoduleFieldBiology } from "./compileSoftNoduleFieldBiology.js";
import { compileSuckerFieldBiology } from "./compileSuckerFieldBiology.js";
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
	"caudal-fin": compileCaudalFinBiology,
	"conforming-surface-field": compileScaleFieldBiology,
	"curved-keratin-spike": compileKeratinSpikeBiology,
	"dental-arch-array": compileDentalBiology,
	"flexible-tapered-tube": compileSoftAppendageBiology,
	"folded-ear-shell": compileHumanEarBiology,
	"forked-soft-tube": compileTongueBiology,
	"hanging-soft-tube": compileSoftAppendageBiology,
	"hanging-surface-lobe": compileSoftLobeBiology,
	"hanging-surface-loft": compileDewlapBiology,
	"human-foot-volume": compileHumanFootBiology,
	"human-nose-loft": compileFacialProjectionBiology,
	"inset-opening-pair": compileFacialProjectionBiology,
	"layered-eye": compileEyeBiology,
	"layered-gill-slit": compileAquaticBiology,
	"layered-mouth-cavity": compileMouthBiology,
	"linear-feather-row": compileFeatherBiology,
	"lobed-soft-volume": compileUdderBiology,
	"lure-stalk": compileSoftAppendageBiology,
	"muzzle-loft": compileFacialProjectionBiology,
	"oral-roof-surface": compileDentalBiology,
	"paired-beak-loft": compileBeakBiology,
	"paired-hoof-shell": compileHoofBiology,
	"prehensile-tube": compileSoftAppendageBiology,
	"proboscis-tube": compileSoftAppendageBiology,
	"radial-feather-fan": compileFeatherBiology,
	"ray-membrane-fin": compileFinBiology,
	"segmented-feeler-chain": compileSegmentedAppendageBiology,
	"single-feather": compileFeatherBiology,
	"soft-dental-arch": compileDentalBiology,
	"soft-ear-shell": compileRuminantEarBiology,
	"soft-nodule-field": compileSoftNoduleFieldBiology,
	"soft-tapered-loft": compileTongueBiology,
	"stiff-strand-field": compileHairFieldBiology,
	"strand-field": compileHairFieldBiology,
	"strand-row": compileHairFieldBiology,
	"sucker-cup-array": compileSuckerFieldBiology,
	"surface-line-field": compileAquaticBiology,
	"surface-ribbon": compileEyelidBiology,
	"tentacle-loft": compileSoftAppendageBiology,
	"tooth-crown-root": compileDentalBiology,
	"transverse-plate-field": compileScaleFieldBiology,
	"trunk-loft": compileSoftAppendageBiology
});

/** Resolves one focused compiler by safely broad category before explicit recipe alias. */
export function biologicalCompilerFor(part) {
	const category = String(part?.semanticCategory || "");
	const recipe = String(part?.parameters?.biologicalGeometryRecipe || "");
	return CATEGORY_COMPILERS[category] || RECIPE_COMPILERS[recipe] || null;
}
