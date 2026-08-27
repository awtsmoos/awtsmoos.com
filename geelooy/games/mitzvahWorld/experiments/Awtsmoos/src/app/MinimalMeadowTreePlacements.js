// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreePlacements.js
 * @description Grows deterministic irregular groves with full-crown playable and access clearances.
 * The Awtsmoos gathers distinct trunks without a dead grid; Awtsmoos.com gives each tree its own
 * turn, height, crown breadth, bark tone, climate, and finite rooted proof inside the meadow.
 */

import { listTreePresets } from './MinimalMeadowTreeCoreFacade.js';
import {
	MINIMAL_MEADOW_GROVES,
	MINIMAL_MEADOW_PLAYABLE_HALF_SIZE,
	MINIMAL_MEADOW_POPULATION_SEED
} from './MinimalMeadowWorldPopulationConfig.js';
import { minimalMeadowPopulationAllows } from './MinimalMeadowWorldPopulationExclusions.js';
import {
	minimalMeadowHasSpacing,
	minimalMeadowSeededUnit
} from './MinimalMeadowWorldPopulationMath.js';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const PROFILES = Object.freeze(['Oak Small', 'Ash Small', 'Birch Small', 'Pine Small']);

export function createMinimalMeadowTreePlacements(terrain, options = {}) {
	const available = new Set(listTreePresets());
	const presets = PROFILES.filter(name => available.has(name));
	if (!presets.length) {
		throw new Error('B"H | canonical procedural tree presets are unavailable.');
	}
	const groveLists = MINIMAL_MEADOW_GROVES.map((grove, groveIndex) => {
		return buildGrove(terrain, grove, groveIndex, presets);
	});
	const limit = options.mobile ? 22 : 32;
	return interleave(groveLists, limit).map((placement, index) => Object.freeze({
		...placement,
		id: `meadow-procedural-tree-${index + 1}`
	}));
}

function buildGrove(terrain, grove, groveIndex, presets) {
	const placements = [];
	for (let attempt = 0; attempt < 160 && placements.length < grove.count; attempt += 1) {
		const key = groveIndex * 211 + attempt;
		const radial = grove.radius * Math.sqrt(minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 11));
		const angle = attempt * GOLDEN_ANGLE + minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 23);
		const x = grove.x + Math.cos(angle) * radial;
		const z = grove.z + Math.sin(angle) * radial;
		if (!minimalMeadowPopulationAllows(x, z, 'tree')) {
			continue;
		}
		const specification = treeSpecification(terrain, grove, groveIndex, key, presets, x, z);
		if (!insidePlayableCrown(specification)) {
			continue;
		}
		if (!minimalMeadowHasSpacing(placements, x, z, 6.2)) {
			continue;
		}
		placements.push(specification);
	}
	return placements;
}

function treeSpecification(terrain, grove, groveIndex, key, presets, x, z) {
	const base = 0.82 + minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 37) * 0.28;
	const scaleX = base * (0.84 + minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 41) * 0.24);
	const scaleY = base * (0.9 + minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 43) * 0.32);
	const scaleZ = base * (0.84 + minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 47) * 0.24);
	return {
		climate: grove.climate,
		groveId: grove.id,
		materialVariant: (key + groveIndex) % 3,
		preset: presets[(key + groveIndex) % presets.length],
		radius: Math.max(scaleX, scaleZ) * 3.8,
		scaleX,
		scaleY,
		scaleZ,
		x,
		y: terrain.heightAt(x, z),
		yaw: minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, 53) * Math.PI * 2,
		z
	};
}

function insidePlayableCrown(tree) {
	return Math.abs(tree.x) + tree.radius <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE
		&& Math.abs(tree.z) + tree.radius <= MINIMAL_MEADOW_PLAYABLE_HALF_SIZE;
}

function interleave(groups, limit) {
	const output = [];
	for (let round = 0; output.length < limit; round += 1) {
		let added = false;
		for (const group of groups) {
			if (group[round] && output.length < limit) {
				output.push(group[round]);
				added = true;
			}
		}
		if (!added) {
			break;
		}
	}
	return output;
}
