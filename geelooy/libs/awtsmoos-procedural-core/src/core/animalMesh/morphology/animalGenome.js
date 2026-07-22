// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos carries inheritance through one lawful animal pipeline. This
 * Awtsmoos.com genome remains deterministic, bounded, serializable, and fully
 * compatible with the original genes API while revealing richer body plans.
 */

import { createAnimalGenomeRandom, hashAnimalGenome } from "./animalGenomeIdentity.js";
import { ANIMAL_GENOME_LINKS, ANIMAL_GENOME_RULES } from "./animalGenomeRules.js";

const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function clamp(value, rule) {
	const bounded = Math.max(rule.minimum, Math.min(rule.maximum, value));
	return rule.integer ? Math.round(bounded) : bounded;
}

function linkedValue(name, source, fallback) {
	for (const pair of ANIMAL_GENOME_LINKS) {
		if (pair[0] === name && source[pair[1]] !== undefined) return source[pair[1]];
		if (pair[1] === name && source[pair[0]] !== undefined) return source[pair[0]];
	}
	return name === "body_depth" && source.body_width !== undefined ? source.body_width : fallback;
}

function normalizeGenes(source = {}) {
	return Object.fromEntries(Object.entries(ANIMAL_GENOME_RULES).map(([name, rule]) => {
		const requested = source[name] ?? linkedValue(name, source, rule.center);
		return [name, clamp(finite(requested, rule.center), rule)];
	}));
}

function creationOptions(input, seed, overrides) {
	if (typeof input === "string") {
		return { archetypeId: input, seed, genes: overrides, generation: 0 };
	}
	return {
		archetypeId: input.archetypeId || input.archetype_id || "custom",
		seed: input.seed ?? 1,
		genes: { ...(input.traits || {}), ...(input.genes || {}) },
		generation: input.generation || 0
	};
}

export { ANIMAL_GENOME_RULES };

export function normalizeAnimalGenome(input = {}) {
	const seed = finite(input.seed, 1) >>> 0;
	const generation = Math.max(0, Math.floor(finite(input.generation, 0)));
	const archetypeId = String(input.archetype_id || input.archetypeId || "custom");
	const genes = normalizeGenes({ ...input, ...(input.traits || {}), ...(input.genes || {}) });
	return Object.freeze({
		schema: "awtsmoos.animal-genome",
		version: "1.1.0",
		id: `genome_${hashAnimalGenome(archetypeId, generation, seed, genes)}`,
		seed,
		generation,
		archetype_id: archetypeId,
		genes: Object.freeze(genes),
		traits: Object.freeze({ ...genes })
	});
}

export function createAnimalGenome(input = {}, seed = 1, overrides = {}) {
	const options = creationOptions(input, seed, overrides);
	const random = createAnimalGenomeRandom(options.seed);
	const sampled = Object.fromEntries(Object.entries(ANIMAL_GENOME_RULES).map(([name, rule]) => [
		name,
		options.genes[name] ?? rule.center + (random() * 2 - 1) * rule.spread
	]));
	return normalizeAnimalGenome({
		seed: options.seed,
		generation: options.generation,
		archetype_id: options.archetypeId,
		genes: sampled
	});
}

export function breedAnimalGenomes(leftInput, rightInput, options = {}) {
	const left = normalizeAnimalGenome(leftInput);
	const right = normalizeAnimalGenome(rightInput);
	if (left.archetype_id !== right.archetype_id && options.allowCrossArchetype !== true) {
		throw new Error('B"H | Cross-archetype breeding requires explicit permission.');
	}
	const seed = finite(options.seed, left.seed ^ right.seed ^ 0x85ebca6b) >>> 0;
	const random = createAnimalGenomeRandom(seed);
	const rate = Math.max(0, Math.min(1, finite(options.mutationRate, 0.12)));
	const scale = Math.max(0, finite(options.mutationScale, 0.12));
	const genes = Object.fromEntries(Object.entries(ANIMAL_GENOME_RULES).map(([name, rule]) => {
		const blend = random();
		let value = left.genes[name] * blend + right.genes[name] * (1 - blend);
		if (random() < rate) value += (random() * 2 - 1) * scale * (rule.maximum - rule.minimum);
		return [name, clamp(value, rule)];
	}));
	return normalizeAnimalGenome({
		seed,
		generation: Math.max(left.generation, right.generation) + 1,
		archetype_id: options.archetypeId || left.archetype_id,
		genes
	});
}
