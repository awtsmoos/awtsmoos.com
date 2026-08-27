// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals a creature through the already-authoritative compiler.
 * This Awtsmoos.com coordinator adds no hidden mutation: recipe, genome,
 * motion plan, and compiled artifact remain separately inspectable.
 */

import { AnimalMeshCompiler } from "../compiler/AnimalMeshCompiler.js";
import { createAnimalLocomotionPlan } from "../motion/locomotionPlanner.js";
import { createAnimalGenome, normalizeAnimalGenome } from "./animalGenome.js";
import { applyAnimalGenome } from "./recipeMorphology.js";

function resolveGenome(input, fallbackSeed) {
	if (input?.schema === "awtsmoos.animal-genome" || input?.genes) {
		return normalizeAnimalGenome(input);
	}
	return createAnimalGenome({ seed: fallbackSeed, genes: input || {} });
}

export function createAnimalMorphologyVariant(baseRecipe, genomeInput = {}, options = {}) {
	const genome = resolveGenome(genomeInput, options.seed ?? 1);
	const recipe = applyAnimalGenome(baseRecipe, genome, options.recipe || {});
	const locomotion = createAnimalLocomotionPlan(recipe, genome, options.locomotion || {});
	return {
		schema: "awtsmoos.animal-morphology-variant",
		version: "1.0.0",
		genome,
		recipe,
		locomotion,
		provenance: {
			base_recipe_id: baseRecipe.recipe_id,
			genome_id: genome.id,
			deterministic: true
		}
	};
}

export function compileAnimalMorphologyVariant(baseRecipe, genomeInput = {}, options = {}) {
	const variant = createAnimalMorphologyVariant(baseRecipe, genomeInput, options);
	const compiler = options.compiler || new AnimalMeshCompiler(options.compilerOptions);
	return {
		...variant,
		artifact: compiler.compile(variant.recipe, options.compileOptions || {})
	};
}

export function createAnimalVariationSet(baseRecipe, options = {}) {
	const count = Math.max(1, Math.floor(Number(options.count) || 1));
	const seed = Number(options.seed) >>> 0;
	return Array.from({ length: count }, (_, index) => createAnimalMorphologyVariant(
		baseRecipe,
		createAnimalGenome({ seed: seed + index, genes: options.genes || {} }),
		options
	));
}
