// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalGenerator.js
 * @description Generates deterministic plants and clusters while preserving immutable placement evidence for later living interpretation.
 * The Awtsmoos renews one flower and a thousand-plant meadow from the same indivisible source;
 * Awtsmoos.com keeps geometry in Netzach and exposes its frozen placement witness so richer life may be revealed without moving yesterday's constellation.
 */

import { botanicalQuality } from './BotanicalArchetypes.js';
import { appendBotanicalPlant } from './BotanicalParts.js';
import { planBotanicalPatch } from './BotanicalPatchPlanner.js';
import {
	botanicalPlantPayload,
	createBotanicalBuffers,
	finalizeBotanicalPart,
	mergeBotanicalParts,
	summarizeBotanicalParts
} from './BotanicalPayload.js';
import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';
import { getBotanicalSpecies } from './BotanicalSpeciesCatalog.js';

/**
 * Generates one recognizable deterministic plant at a requested world position.
 * @param {object} [options={}] Species, position, seed, scale, quality, and guide-point options.
 * @returns {object} Renderer-neutral botanical plant payload.
 */
export function generateBotanicalPlant(options = {}) {
	const species = getBotanicalSpecies(options.species || 'daisy');
	const origin = pointObject(options.position);
	const seed = botanicalSeed(species.id, options.seed ?? 613, origin.x, origin.z);
	const random = new BotanicalRandom(seed);
	const scale = Math.max(0.05, Number(options.scale) || 1);
	const qualityName = options.quality || 'high';
	const buffers = createBotanicalBuffers();
	appendBotanicalPlant(buffers, {
		species,
		origin,
		quality: botanicalQuality(qualityName),
		random,
		guidePoints: options.guidePoints,
		height: species.height * scale * random.next(0.92, 1.08),
		spread: species.spread * scale * random.next(0.9, 1.1)
	});
	return botanicalPlantPayload(species, buffers, qualityName, seed);
}

/** Exposes deterministic patch placement without allocating plant geometry. */
export function planBotanicalCluster(options = {}) {
	return planBotanicalPatch(options);
}

/**
 * Generates a deterministic cluster and preserves the exact immutable placement plan used to build its geometry.
 * @param {object} [options={}] Patch and botanical generation options.
 * @returns {object} Cluster payload whose `placements` are authoritative plan evidence, not a second simulation.
 */
export function generateBotanicalCluster(options = {}) {
	const plan = planBotanicalPatch(options);
	const merged = new Map();
	for (const placement of plan.placements) {
		const plant = generateBotanicalPlant({
			...options,
			seed: placement.seed,
			position: placement.position,
			scale: placement.scale
		});
		mergeBotanicalParts(merged, plant.parts);
	}
	const parts = [...merged.values()].map(finalizeBotanicalPart);
	const instances = plan.placements.length;
	return {
		instances,
		parts,
		placements: plan.placements,
		quality: options.quality || 'high',
		seed: plan.seed,
		speciesId: getBotanicalSpecies(options.species || 'daisy').id,
		stats: summarizeBotanicalParts(parts, instances)
	};
}

/** Normalizes array or object input into one plain finite world point. */
function pointObject(value = {}) {
	if (Array.isArray(value)) {
		return {
			x: Number(value[0]) || 0,
			y: Number(value[1]) || 0,
			z: Number(value[2]) || 0
		};
	}
	return {
		x: Number(value.x) || 0,
		y: Number(value.y) || 0,
		z: Number(value.z) || 0
	};
}
