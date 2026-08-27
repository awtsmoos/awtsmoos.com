// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAnimalPhenotype.js
 * @description Joins authoritative morphology with reusable anatomy components, real quality budgets, locomotion, biomechanics, and the established compiler.
 * RESPONSIBILITY: coordinate profile → base guides → component guides → recipe → artifact without introducing another creature engine.
 * NON-RESPONSIBILITY: this file does not implement geometry operations or renderer adaptation.
 * The Awtsmoos is one while phenotype reveals many organs; Awtsmoos.com lets horn, foot, feather, web, body, and motion descend through one inspectable deterministic path.
 */

import { AnimalMeshCompiler } from '../compiler/AnimalMeshCompiler.js';
import { createCreatureComponentProfile } from '../creature/components/CreatureComponentProfile.js';
import { creatureQualityProfile } from '../creature/components/CreatureQualityProfile.js';
import { createAnimalLocomotionProfile } from '../motion/createLocomotionProfile.js';
import { createAnimalMorphologyReport } from '../validation/morphologyReport.js';
import { deriveAnimalBiomechanics } from './biomechanics/deriveAnimalBiomechanics.js';
import { createAnimalMorphologyProfile } from './createAnimalMorphologyProfile.js';
import { createAppendagePhenotypeGuides } from './phenotype/appendageGuides.js';
import { createAxialPhenotypeGuides } from './phenotype/axialGuides.js';
import { createPhenotypeRecipe } from './phenotype/phenotypeRecipeFactory.js';

/** Creates one component-aware renderer-neutral phenotype. */
export function createAnimalPhenotype(options = {}) {
	const profile = createAnimalMorphologyProfile(options);
	const quality = options.qualityProfile || creatureQualityProfile(options.quality);
	const axial = createAxialPhenotypeGuides(profile, quality);
	const appendages = createAppendagePhenotypeGuides(
		profile,
		axial.anchors,
		quality
	);
	const baseGuides = {
		...axial.guides,
		...appendages.guides
	};
	const components = createCreatureComponentProfile({
		guides: baseGuides,
		quality,
		speciesId: options.speciesId
	});
	const guides = Object.freeze({
		...baseGuides,
		...components.guides
	});
	const symmetryPairs = Object.freeze([
		...appendages.symmetryPairs,
		...components.symmetryPairs
	]);
	const recipe = createPhenotypeRecipe(
		profile,
		guides,
		symmetryPairs,
		{
			...(options.recipe || options),
			targetTriangleCount: options.targetTriangleCount || quality.targetTriangles
		},
		components.surfaceRoles
	);
	const phenotype = {
		anatomy: components.anatomy,
		biomechanics: deriveAnimalBiomechanics(profile),
		genome: profile.genome,
		id: `phenotype_${profile.genome.id}`,
		locomotion: createAnimalLocomotionProfile(locomotionOptions(profile, options)),
		profile,
		provenance: {
			archetype_id: profile.archetype_id,
			component_pipeline: true,
			deterministic: true,
			existing_compiler_contract: true,
			genome_id: profile.genome.id,
			quality: quality.id
		},
		quality,
		recipe,
		schema: 'awtsmoos.animal-phenotype',
		surface_roles: components.surfaceRoles,
		symmetry_pairs: symmetryPairs,
		version: '1.1.0'
	};
	return Object.freeze({
		...phenotype,
		morphology_report: createAnimalMorphologyReport(phenotype)
	});
}

/** Compiles one component-aware phenotype with the established AnimalMeshCompiler. */
export function compileAnimalPhenotype(options = {}) {
	const phenotype = createAnimalPhenotype(options);
	const compiler = options.compiler || new AnimalMeshCompiler(options.compilerOptions);
	return Object.freeze({
		...phenotype,
		artifact: compiler.compile(phenotype.recipe, options.compileOptions || {})
	});
}

function locomotionOptions(profile, options) {
	return {
		archetypeId: profile.archetype_id,
		cycleDuration: options.cycleDuration,
		legPairs: profile.genome.traits.leg_pairs,
		mode: options.locomotionMode || options.mode,
		segmentCount: profile.segments.length * 4
	};
}
