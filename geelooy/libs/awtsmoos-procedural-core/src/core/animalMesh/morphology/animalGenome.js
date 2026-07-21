// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every inherited trait without confusing variation with
 * chaos. This Awtsmoos.com vessel bounds every gene, preserves determinism,
 * and lets many creatures unfold from one lawful recipe.
 */

const GENE_RULES = Object.freeze({
	body_length: { minimum: 0.55, maximum: 1.8, center: 1, spread: 0.28 },
	body_width: { minimum: 0.55, maximum: 1.7, center: 1, spread: 0.24 },
	body_height: { minimum: 0.6, maximum: 1.65, center: 1, spread: 0.2 },
	appendage_length: { minimum: 0.5, maximum: 1.9, center: 1, spread: 0.32 },
	appendage_thickness: { minimum: 0.55, maximum: 1.65, center: 1, spread: 0.24 },
	head_scale: { minimum: 0.55, maximum: 1.65, center: 1, spread: 0.2 },
	tail_length: { minimum: 0.25, maximum: 2.4, center: 1, spread: 0.45 },
	muscle_bulk: { minimum: 0.55, maximum: 1.65, center: 1, spread: 0.22 },
	spine_bend: { minimum: -0.35, maximum: 0.35, center: 0, spread: 0.12 },
	stance_width: { minimum: 0.6, maximum: 1.7, center: 1, spread: 0.22 },
	gait_frequency: { minimum: 0.35, maximum: 2.5, center: 1, spread: 0.35 },
	gait_stride: { minimum: 0.35, maximum: 2.1, center: 1, spread: 0.3 },
	flexibility: { minimum: 0, maximum: 1, center: 0.5, spread: 0.28 }
});

function clamp(value, rule) {
	return Math.max(rule.minimum, Math.min(rule.maximum, value));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function createRandom(seed) {
	let state = (Number(seed) >>> 0) || 0x9e3779b9;
	return () => {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		return (state >>> 0) / 4294967296;
	};
}

function hashGenome(seed, genes) {
	const text = `${seed}|${Object.entries(genes).map(([key, value]) => `${key}:${value}`).join("|")}`;
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, "0");
}

export const ANIMAL_GENOME_RULES = GENE_RULES;

export function normalizeAnimalGenome(input = {}) {
	const seed = finite(input.seed, 1) >>> 0;
	const source = input.genes || input;
	const genes = {};
	for (const [name, rule] of Object.entries(GENE_RULES)) {
		genes[name] = clamp(finite(source[name], rule.center), rule);
	}
	return {
		schema: "awtsmoos.animal-genome",
		version: "1.0.0",
		id: `genome_${hashGenome(seed, genes)}`,
		seed,
		genes
	};
}

export function createAnimalGenome(options = {}) {
	const seed = finite(options.seed, 1) >>> 0;
	const random = createRandom(seed);
	const requested = options.genes || {};
	const genes = {};
	for (const [name, rule] of Object.entries(GENE_RULES)) {
		const sampled = rule.center + (random() * 2 - 1) * rule.spread;
		genes[name] = requested[name] ?? sampled;
	}
	return normalizeAnimalGenome({ seed, genes });
}

export function breedAnimalGenomes(leftInput, rightInput, options = {}) {
	const left = normalizeAnimalGenome(leftInput);
	const right = normalizeAnimalGenome(rightInput);
	const seed = finite(options.seed, left.seed ^ right.seed ^ 0x85ebca6b) >>> 0;
	const random = createRandom(seed);
	const mutationRate = Math.max(0, Math.min(1, finite(options.mutationRate, 0.12)));
	const mutationScale = Math.max(0, finite(options.mutationScale, 0.12));
	const genes = {};
	for (const [name, rule] of Object.entries(GENE_RULES)) {
		const blend = random();
		let value = left.genes[name] * blend + right.genes[name] * (1 - blend);
		if (random() < mutationRate) {
			value += (random() * 2 - 1) * mutationScale * (rule.maximum - rule.minimum);
		}
		genes[name] = clamp(value, rule);
	}
	return normalizeAnimalGenome({ seed, genes });
}
