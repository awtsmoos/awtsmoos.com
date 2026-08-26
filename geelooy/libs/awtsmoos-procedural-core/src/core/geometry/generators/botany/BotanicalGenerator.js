// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalGenerator.js
 * @description Generates deterministic plants and clusters while carrying morphology, guide, support, and growth evidence into canonical botanical parts.
 * The Awtsmoos renews one flower and a thousand-plant meadow from the same indivisible source; Awtsmoos.com lets explicit guides and living tropisms enter one stable vessel,
 * so beginner species calls stay small while vines, flowers, shrubs, grass, and future growth laws receive professional advanced inputs without API fracture.
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
 * @param {object} [optionsChesed={}] Species, position, seed, scale, quality, guide, support, and advanced growth options.
 * @returns {object} Renderer-neutral botanical plant payload.
 */
export function generateBotanicalPlant(optionsChesed = {}) {
	const speciesBinah = getBotanicalSpecies(
		optionsChesed.species || 'daisy'
	);
	const originMalchus = pointObject(optionsChesed.position);
	const seedYesod = botanicalSeed(
		speciesBinah.id,
		optionsChesed.seed ?? 613,
		originMalchus.x,
		originMalchus.z
	);
	const randomChochmah = new BotanicalRandom(seedYesod);
	const scaleTiferes = Math.max(
		0.05,
		Number(optionsChesed.scale) || 1
	);
	const qualityHod = optionsChesed.quality || 'high';
	const buffersMalchus = createBotanicalBuffers();

	appendBotanicalPlant(buffersMalchus, {
		growth: optionsChesed.growth,
		guidePoints: optionsChesed.guidePoints,
		height: speciesBinah.height * scaleTiferes *
			randomChochmah.next(0.92, 1.08),
		origin: originMalchus,
		quality: botanicalQuality(qualityHod),
		random: randomChochmah,
		species: speciesBinah,
		spread: speciesBinah.spread * scaleTiferes *
			randomChochmah.next(0.9, 1.1),
		supportPoints: optionsChesed.supportPoints
	});

	return botanicalPlantPayload(
		speciesBinah,
		buffersMalchus,
		qualityHod,
		seedYesod
	);
}

/**
 * Exposes deterministic patch placement without allocating plant geometry.
 * @param {object} [optionsChesed={}] Botanical patch planning options.
 * @returns {Readonly<object>} Immutable placement plan.
 */
export function planBotanicalCluster(optionsChesed = {}) {
	return planBotanicalPatch(optionsChesed);
}

/**
 * Generates a deterministic cluster while preserving the exact placement plan used to build its geometry.
 * @param {object} [optionsChesed={}] Patch, species, quality, growth, and botanical generation options.
 * @returns {object} Renderer-neutral cluster payload with authoritative placement evidence.
 */
export function generateBotanicalCluster(optionsChesed = {}) {
	const planBinah = planBotanicalPatch(optionsChesed);
	const mergedYesod = new Map();
	for (const placementMalchus of planBinah.placements) {
		const plantMalchus = generateBotanicalPlant({
			...optionsChesed,
			position: placementMalchus.position,
			scale: placementMalchus.scale,
			seed: placementMalchus.seed
		});
		mergeBotanicalParts(
			mergedYesod,
			plantMalchus.parts
		);
	}
	const partsMalchus = [...mergedYesod.values()].map(
		finalizeBotanicalPart
	);
	const instancesNetzach = planBinah.placements.length;
	return {
		instances: instancesNetzach,
		parts: partsMalchus,
		placements: planBinah.placements,
		quality: optionsChesed.quality || 'high',
		seed: planBinah.seed,
		speciesId: getBotanicalSpecies(
			optionsChesed.species || 'daisy'
		).id,
		stats: summarizeBotanicalParts(
			partsMalchus,
			instancesNetzach
		)
	};
}

/**
 * Normalizes array or object input into one finite world-space point.
 * @param {Array<number>|object} [valueOhr={}] Candidate position.
 * @returns {{x:number,y:number,z:number}} Plain world point.
 */
function pointObject(valueOhr = {}) {
	const sourceOhr = Array.isArray(valueOhr)
		? { x: valueOhr[0], y: valueOhr[1], z: valueOhr[2] }
		: valueOhr;
	return {
		x: Number(sourceOhr.x) || 0,
		y: Number(sourceOhr.y) || 0,
		z: Number(sourceOhr.z) || 0
	};
}
