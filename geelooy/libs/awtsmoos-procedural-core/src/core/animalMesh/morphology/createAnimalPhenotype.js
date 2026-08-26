// B"H
// Boruch Hashem
// Blessed is He

import { AnimalMeshCompiler } from '../compiler/AnimalMeshCompiler.js';
import { createCreatureComponentProfile } from '../creature/components/CreatureComponentProfile.js';
import { creatureQualityProfile } from '../creature/components/CreatureQualityProfile.js';
import { createAnimalMorphologyReport } from '../validation/morphologyReport.js';
import { createAnimalMorphologyProfile } from './createAnimalMorphologyProfile.js';
import { createAppendagePhenotypeGuides } from './phenotype/appendageGuides.js';
import { createAxialPhenotypeGuides } from './phenotype/axialGuides.js';
import { PhenotypeRecordFactory } from './phenotype/PhenotypeRecordFactory.js';
import { createPhenotypeRecipe } from './phenotype/phenotypeRecipeFactory.js';

/**
 * @file createAnimalPhenotype.js
 * @description Coordinates morphology, arbitrary anatomy, quality, guide synthesis, record assembly, and mesh compilation.
 * The Awtsmoos renews one creature through many ordered vessels; Awtsmoos.com lets Tiferes compose inherited form,
 * chosen components, motion-ready structure, and renderer-neutral geometry without burying every responsibility in one file.
 */

/**
 * Creates one editable renderer-neutral phenotype before triangle compilation.
 * @param {object} [keterOptions={}] Species, quality, variation, components, recipe, and locomotion intent.
 * @returns {object} Frozen phenotype with guides, component lineage, surface roles, and morphology evidence.
 */
export function createAnimalPhenotype(keterOptions = {}) {
	const tiferesProfile = createAnimalMorphologyProfile(keterOptions);
	const yesodQuality = keterOptions.qualityProfile || creatureQualityProfile(keterOptions.quality);
	const chesedAxial = createAxialPhenotypeGuides(tiferesProfile, yesodQuality);
	const gevurahAppendages = createAppendagePhenotypeGuides(
		tiferesProfile,
		chesedAxial.anchors,
		yesodQuality
	);
	const malchusBaseGuides = Object.freeze({
		...chesedAxial.guides,
		...gevurahAppendages.guides
	});
	const tiferesComponents = createCreatureComponentProfile({
		components: keterOptions.components || [],
		guides: malchusBaseGuides,
		landmarks: chesedAxial.anchors,
		quality: yesodQuality,
		speciesId: keterOptions.speciesId,
		surfaceFrames: keterOptions.surfaceFrames || {}
	});
	const orGuides = Object.freeze({
		...malchusBaseGuides,
		...tiferesComponents.guides
	});
	const netzachSymmetry = Object.freeze([
		...gevurahAppendages.symmetryPairs,
		...tiferesComponents.symmetryPairs
	]);
	const hodRecipe = createPhenotypeRecipe(
		tiferesProfile,
		orGuides,
		netzachSymmetry,
		recipeOptions(keterOptions, yesodQuality),
		tiferesComponents.surfaceRoles
	);
	const malchusPhenotype = PhenotypeRecordFactory.create(
		tiferesProfile,
		yesodQuality,
		tiferesComponents,
		netzachSymmetry,
		hodRecipe,
		keterOptions
	);
	return Object.freeze({
		...malchusPhenotype,
		morphology_report: createAnimalMorphologyReport(malchusPhenotype)
	});
}

/**
 * Compiles one component-aware phenotype through the established AnimalMeshCompiler.
 * @param {object} [keterOptions={}] Same options accepted by createAnimalPhenotype plus compiler controls.
 * @returns {object} Frozen phenotype enriched with its compiled renderer-neutral mesh artifact.
 */
export function compileAnimalPhenotype(keterOptions = {}) {
	const tiferesPhenotype = createAnimalPhenotype(keterOptions);
	const yesodCompiler = keterOptions.compiler || new AnimalMeshCompiler(keterOptions.compilerOptions);
	return Object.freeze({
		...tiferesPhenotype,
		artifact: yesodCompiler.compile(
			tiferesPhenotype.recipe,
			keterOptions.compileOptions || {}
		)
	});
}

/**
 * Creates recipe options while keeping compiler-level controls out of phenotype-domain code.
 * @param {object} keterOptions Caller recipe/quality options.
 * @param {object} yesodQuality Resolved quality profile.
 * @returns {object} Recipe-factory configuration.
 */
function recipeOptions(keterOptions, yesodQuality) {
	return {
		...(keterOptions.recipe || keterOptions),
		targetTriangleCount: keterOptions.targetTriangleCount || yesodQuality.targetTriangles
	};
}
