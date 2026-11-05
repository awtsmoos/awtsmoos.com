// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFlowerClumpGeometry.js
 * @description Positions rooted mixed-species clumps with visible per-vertex palettes in two meshes.
 * The Awtsmoos gathers many botanical gestures into one measured cell;
 * Awtsmoos.com preserves terrain contact, deterministic color, quality budgets, and draw-call economy.
 */

import { appendMinimalMeadowFlowerClump } from './MinimalMeadowFlowerClumpPopulation.js';
import { minimalMeadowSeededUnit } from './MinimalMeadowWorldPopulationMath.js';

export function createMinimalMeadowFlowerCellGeometry(options = {}) {
	const clumps = Math.max(1, Number(options.clumps) || 8);
	const terrain = options.terrain;
	const center = options.center || { x: 0, y: 0, z: 0 };
	const species = options.species || fallbackSpecies();
	const community = options.speciesCommunity?.length ? options.speciesCommunity : [species];
	const seed = Number(options.seed) || 178;
	const grass = geometry();
	const petals = geometry();
	let flowers = 0;
	const speciesIds = new Set();
	for (let index = 0; index < clumps; index += 1) {
		const point = clumpPoint(index, seed);
		const clumpSpecies = community[index % community.length] || species;
		speciesIds.add(clumpSpecies.id);
		const worldY = terrain.heightAt(center.x + point.x, center.z + point.z);
		flowers += appendMinimalMeadowFlowerClump({
			budget: options.budget || {},
			grass,
			grassColor: options.grassColor,
			index,
			petals,
			seed,
			species: clumpSpecies,
			x: point.x,
			y: worldY - center.y + 0.02,
			z: point.z
		});
	}
	return { clumps, flowers, grass, petalCount: species.petalCount, petals, speciesId: species.id, speciesIds: [...speciesIds] };
}

function clumpPoint(index, seed) {
	const angle = index * 2.399963 + unit(seed, index, 17) * 0.72;
	const radius = 0.9 + (index % 4) * 1.18 + unit(seed, index, 19) * 0.48;
	return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

function geometry() {
	return { colors: [], faces: [], uvs: [], vertices: [] };
}

function unit(seed, index, salt) {
	return minimalMeadowSeededUnit(seed, index, salt);
}

function fallbackSpecies() {
	return {
		centerColor: '#e7b73f', color: '#fff7df', height: 0.24, id: 'meadow-daisy',
		leafChance: 0.7, leafColor: '#4f8f39', petalCount: 8, petalLayers: 1,
		petalRadius: 0.045, seedHeadChance: 0.08, stemWidth: 0.016
	};
}
