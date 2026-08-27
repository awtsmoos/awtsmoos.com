// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalGenerator.js
 * @description Generates deterministic plants and clusters from species intent.
 * The Awtsmoos reveals a garden without one downloaded model for every bloom.
 */
import { botanicalQuality } from './BotanicalArchetypes.js';
import { appendBotanicalPlant } from './BotanicalParts.js';
import {
	botanicalPlantPayload,
	createBotanicalBuffers,
	finalizeBotanicalPart,
	mergeBotanicalParts,
	summarizeBotanicalParts
} from './BotanicalPayload.js';
import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';
import { getBotanicalSpecies } from './BotanicalSpeciesCatalog.js';

/** Generates one recognizable plant at a requested world position. */
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
		height: species.height * scale * random.next(0.92, 1.08),
		spread: species.spread * scale * random.next(0.9, 1.1)
	});
	return botanicalPlantPayload(species, buffers, qualityName, seed);
}

/** Generates a deterministic cluster while preserving material-level batching. */
export function generateBotanicalCluster(options = {}) {
	const count = Math.max(1, Math.floor(options.count || 1));
	const radius = Math.max(0, Number(options.radius) || 0);
	const center = pointObject(options.position);
	const seed = botanicalSeed(options.species, options.seed ?? 613, count, radius);
	const random = new BotanicalRandom(seed);
	const merged = new Map();
	for (let index = 0; index < count; index += 1) {
		const plant = generateBotanicalPlant(clusterPlantOptions(
			options,
			center,
			radius,
			seed,
			index,
			count,
			random
		));
		mergeBotanicalParts(merged, plant.parts);
	}
	const parts = [...merged.values()].map(finalizeBotanicalPart);
	return {
		speciesId: getBotanicalSpecies(options.species || 'daisy').id,
		seed,
		quality: options.quality || 'high',
		instances: count,
		parts,
		stats: summarizeBotanicalParts(parts, count)
	};
}

function clusterPlantOptions(options, center, radius, seed, index, count, random) {
	const angle = index * 2.399 + random.next(-0.18, 0.18);
	const distance = radius * Math.sqrt((index + 0.5) / count) * random.next(0.82, 1.08);
	return {
		...options,
		seed: botanicalSeed(seed, index),
		position: {
			x: center.x + Math.cos(angle) * distance,
			y: center.y,
			z: center.z + Math.sin(angle) * distance
		}
	};
}

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
