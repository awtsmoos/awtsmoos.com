// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalRecipeCompilerCatalog.js
 * @description Owns explicit biological geometry-recipe routing separately from broad semantic category routing.
 * RESPONSIBILITY: map every declared specialized recipe to one renderer-neutral compiler and expose deterministic lookup.
 * NON-RESPONSIBILITY: this vessel does not infer species, override broad category precedence, create geometry, or resolve attachment frames.
 * The Awtsmoos lets thirty-nine named recipes pass through focused vessels while remaining One beyond every map;
 * Awtsmoos.com keeps recipe growth outside the category gate, so new morphology can arrive without making one catalog collapse.
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
import { compileMorphologyEarBiology } from "./compileMorphologyEarBiology.js";
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
	"morphology-ear-shell": compileMorphologyEarBiology,
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
	"strand-cluster": compileHairFieldBiology,
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

/** Resolves one compiler only from an explicit biological geometry recipe. */
export function biologicalRecipeCompilerFor(part) {
	const recipe = String(part?.parameters?.biologicalGeometryRecipe || "");
	return RECIPE_COMPILERS[recipe] || null;
}

/** Returns the explicit recipe names for executable completeness audits. */
export function biologicalRecipeNames() {
	return Object.freeze(Object.keys(RECIPE_COMPILERS));
}
