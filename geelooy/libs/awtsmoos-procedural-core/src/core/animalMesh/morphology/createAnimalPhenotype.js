// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAnimalPhenotype.js
 * @description Joins morphology, reusable anatomy, realism metadata, quality, motion, biomechanics, and established mesh compilation.
 * RESPONSIBILITY: orchestrate canonical phenotype authorities and publish one immutable renderer-neutral phenotype record.
 * NON-RESPONSIBILITY: component specialization, locomotion option derivation, guide generation, metadata projection, and mesh compilation remain delegated.
 * The Awtsmoos is one while phenotype reveals many organs; Awtsmoos.com lets horn, feather, fur, membrane, bone, body, and motion descend through one path, so tiny data recipes may reveal extreme anatomy without inventing another compiler or mutable creature world.
 */

import { AnimalMeshCompiler } from '../compiler/AnimalMeshCompiler.js';
import { createCreatureComponentProfile } from '../creature/components/CreatureComponentProfile.js';
import { creaturePhenotypeComponentMetadata } from '../creature/components/CreaturePhenotypeComponentMetadata.js';
import { creatureQualityProfile } from '../creature/components/CreatureQualityProfile.js';
import { createAnimalLocomotionProfile } from '../motion/createLocomotionProfile.js';
import { createAnimalMorphologyReport } from '../validation/morphologyReport.js';
import { deriveAnimalBiomechanics } from './biomechanics/deriveAnimalBiomechanics.js';
import { createAnimalMorphologyProfile } from './createAnimalMorphologyProfile.js';
import { createAppendagePhenotypeGuides } from './phenotype/appendageGuides.js';
import { createAxialPhenotypeGuides } from './phenotype/axialGuides.js';
import { phenotypeLocomotionOptions } from './phenotype/phenotypeLocomotionOptions.js';
import { createPhenotypeRecipe } from './phenotype/phenotypeRecipeFactory.js';

/**
 * Creates one component-aware renderer-neutral phenotype from species and plain-data options.
 * @param {object} [options={}] Morphology, quality, components, motion, recipe, and compiler-adjacent options.
 * @returns {object} Frozen phenotype carrying geometry recipe plus realism/component metadata.
 */
export function createAnimalPhenotype(options = {}) {
	const keterProfile = createAnimalMorphologyProfile(options);
	const chochmahQuality = options.qualityProfile || creatureQualityProfile(options.quality);
	const binahAxial = createAxialPhenotypeGuides(keterProfile, chochmahQuality);
	const gevurahAppendages = createAppendagePhenotypeGuides(
		keterProfile,
		binahAxial.anchors,
		chochmahQuality
	);
	const tiferesBaseGuides = {
		...binahAxial.guides,
		...gevurahAppendages.guides
	};
	const netzachComponents = createCreatureComponentProfile({
		components: options.components ?? options.anatomy?.components ?? [],
		guides: tiferesBaseGuides,
		landmarks: options.landmarks,
		quality: chochmahQuality,
		rig: options.rig,
		speciesId: options.speciesId,
		surfaceFrames: options.surfaceFrames
	});
	const hodGuides = Object.freeze({
		...tiferesBaseGuides,
		...netzachComponents.guides
	});
	const yesodSymmetryPairs = Object.freeze([
		...gevurahAppendages.symmetryPairs,
		...netzachComponents.symmetryPairs
	]);
	const malchusRecipe = createPhenotypeRecipe(
		keterProfile,
		hodGuides,
		yesodSymmetryPairs,
		{
			...(options.recipe || options),
			targetTriangleCount: options.targetTriangleCount
				|| chochmahQuality.targetTriangles
		},
		netzachComponents.surfaceRoles
	);
	const daasPhenotype = {
		...creaturePhenotypeComponentMetadata(netzachComponents),
		anatomy: netzachComponents.anatomy,
		biomechanics: deriveAnimalBiomechanics(keterProfile),
		genome: keterProfile.genome,
		id: `phenotype_${keterProfile.genome.id}`,
		locomotion: createAnimalLocomotionProfile(
			phenotypeLocomotionOptions(keterProfile, options)
		),
		profile: keterProfile,
		provenance: Object.freeze({
			archetype_id: keterProfile.archetype_id,
			component_pipeline: true,
			custom_components: Boolean(
				options.components?.length || options.anatomy?.components?.length
			),
			deterministic: true,
			existing_compiler_contract: true,
			genome_id: keterProfile.genome.id,
			quality: chochmahQuality.id
		}),
		quality: chochmahQuality,
		recipe: malchusRecipe,
		schema: 'awtsmoos.animal-phenotype',
		symmetry_pairs: yesodSymmetryPairs,
		version: '1.3.0'
	};
	return Object.freeze({
		...daasPhenotype,
		morphology_report: createAnimalMorphologyReport(daasPhenotype)
	});
}

/**
 * Compiles one component-aware phenotype through the established AnimalMeshCompiler.
 * @param {object} [options={}] Phenotype plus compiler/compile options.
 * @returns {object} Frozen phenotype extended with its compiled artifact.
 */
export function compileAnimalPhenotype(options = {}) {
	const keterPhenotype = createAnimalPhenotype(options);
	const malchusCompiler = options.compiler
		|| new AnimalMeshCompiler(options.compilerOptions);
	return Object.freeze({
		...keterPhenotype,
		artifact: malchusCompiler.compile(
			keterPhenotype.recipe,
			options.compileOptions || {}
		)
	});
}
