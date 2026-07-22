// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals a complete phenotype through already-authoritative
 * vessels. This Awtsmoos.com coordinator creates no rival compiler, schema,
 * renderer, or solver; every intermediate contract remains inspectable.
 */

import { AnimalMeshCompiler } from "../compiler/AnimalMeshCompiler.js";
import { createAnimalLocomotionProfile } from "../motion/createLocomotionProfile.js";
import { createAnimalMorphologyReport } from "../validation/morphologyReport.js";
import { deriveAnimalBiomechanics } from "./biomechanics/deriveAnimalBiomechanics.js";
import { createAnimalMorphologyProfile } from "./createAnimalMorphologyProfile.js";
import { createAppendagePhenotypeGuides } from "./phenotype/appendageGuides.js";
import { createAxialPhenotypeGuides } from "./phenotype/axialGuides.js";
import { createPhenotypeRecipe } from "./phenotype/phenotypeRecipeFactory.js";

function locomotionOptions(profile, options) {
	return {
		archetypeId: profile.archetype_id,
		mode: options.locomotionMode || options.mode,
		cycleDuration: options.cycleDuration,
		segmentCount: profile.segments.length * 4,
		legPairs: profile.genome.traits.leg_pairs
	};
}

export function createAnimalPhenotype(options = {}) {
	const profile = createAnimalMorphologyProfile(options);
	const axial = createAxialPhenotypeGuides(profile);
	const appendages = createAppendagePhenotypeGuides(profile, axial.anchors);
	const guides = Object.freeze({ ...axial.guides, ...appendages.guides });
	const recipe = createPhenotypeRecipe(
		profile,
		guides,
		appendages.symmetryPairs,
		options.recipe || options
	);
	const phenotype = {
		schema: "awtsmoos.animal-phenotype",
		version: "1.0.0",
		id: `phenotype_${profile.genome.id}`,
		profile,
		genome: profile.genome,
		recipe,
		symmetry_pairs: appendages.symmetryPairs,
		locomotion: createAnimalLocomotionProfile(locomotionOptions(profile, options)),
		biomechanics: deriveAnimalBiomechanics(profile),
		provenance: {
			genome_id: profile.genome.id,
			archetype_id: profile.archetype_id,
			existing_compiler_contract: true,
			deterministic: true
		}
	};
	return Object.freeze({
		...phenotype,
		morphology_report: createAnimalMorphologyReport(phenotype)
	});
}

export function compileAnimalPhenotype(options = {}) {
	const phenotype = createAnimalPhenotype(options);
	const compiler = options.compiler || new AnimalMeshCompiler(options.compilerOptions);
	return Object.freeze({
		...phenotype,
		artifact: compiler.compile(phenotype.recipe, options.compileOptions || {})
	});
}
