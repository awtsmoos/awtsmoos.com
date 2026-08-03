// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFlowerClumpPopulation.js
 * @description Appends one deterministic multicolor clump into shared grass and flower buffers.
 * The Awtsmoos lets blade, leaf, blossom, center, and seed head emerge from one rooted point;
 * Awtsmoos.com preserves species palette, quality limits, and two-mesh batching in every joint.
 */

import {
	appendMinimalMeadowBlade,
	appendMinimalMeadowFlower,
	appendMinimalMeadowLeafPair,
	appendMinimalMeadowSeedHead
} from './MinimalMeadowBotanicalGeometry.js';
import { minimalMeadowBotanicalColor, minimalMeadowBotanicalTint } from './MinimalMeadowBotanicalColor.js';
import { minimalMeadowSeededUnit } from './MinimalMeadowWorldPopulationMath.js';

export function appendMinimalMeadowFlowerClump(options) {
	const bladeLimit = Math.max(7, options.budget.bladesPerClump || 12);
	const bladeCount = Math.min(bladeLimit, 8 + Math.floor(unit(options, 23) * 7));
	for (let blade = 0; blade < bladeCount; blade += 1) appendBlade(options, blade);
	const flowerLimit = Math.max(2, options.budget.flowersPerClump || 5);
	const flowerCount = Math.min(flowerLimit, 2 + Math.floor(unit(options, 41) * 5));
	for (let flower = 0; flower < flowerCount; flower += 1) appendFlower(options, flower);
	return flowerCount;
}

function appendBlade(options, blade) {
	const angle = options.index * 1.7 + blade * 0.73 + seeded(options.seed, blade, options.index) * 0.42;
	const offset = 0.12 + seeded(options.seed, options.index * 31 + blade, 29) * 0.52;
	const height = 0.34 + seeded(options.seed, blade, options.index + 37) * 0.5;
	const base = minimalMeadowBotanicalColor(options.grassColor || '#4f8f39');
	appendMinimalMeadowBlade(options.grass, {
		angle,
		bend: 0.05 + seeded(options.seed, blade, 61) * 0.13,
		color: minimalMeadowBotanicalTint(base, 0.82 + seeded(options.seed, blade, 67) * 0.28),
		height,
		segments: 3,
		width: 0.045 + height * 0.035,
		x: options.x + Math.cos(angle) * offset,
		y: options.y,
		z: options.z + Math.sin(angle) * offset
	});
}

function appendFlower(options, flower) {
	const angle = options.index * 0.73 + flower * 2.399963 + seeded(options.seed, flower, options.index + 43) * 0.5;
	const radius = 0.18 + seeded(options.seed, options.index * 17 + flower, 47) * 0.38;
	const x = options.x + Math.cos(angle) * radius;
	const z = options.z + Math.sin(angle) * radius;
	const height = options.species.height * (0.82 + seeded(options.seed, flower, options.index + 53) * 0.42);
	const leafColor = minimalMeadowBotanicalColor(options.species.leafColor || '#4f8f39');
	appendMinimalMeadowBlade(options.grass, {
		angle, bend: 0.03, color: leafColor, height, segments: 3,
		width: options.species.stemWidth, x, y: options.y, z
	});
	const flowerOptions = {
		angle,
		centerColor: minimalMeadowBotanicalColor(options.species.centerColor),
		height,
		layers: options.species.petalLayers,
		leafColor,
		petalColor: minimalMeadowBotanicalColor(options.species.color),
		petals: options.species.petalCount,
		radius: options.species.petalRadius,
		rotation: angle,
		x, y: options.y + height, z
	};
	if (seeded(options.seed, flower, 71) < options.species.leafChance) appendMinimalMeadowLeafPair(options.grass, flowerOptions);
	appendMinimalMeadowFlower(options.petals, flowerOptions);
	if (seeded(options.seed, flower, 73) < options.species.seedHeadChance) appendMinimalMeadowSeedHead(options.petals, flowerOptions);
}

function unit(options, salt) {
	return seeded(options.seed, options.index, salt);
}

function seeded(seed, index, salt) {
	return minimalMeadowSeededUnit(seed, index, salt);
}
