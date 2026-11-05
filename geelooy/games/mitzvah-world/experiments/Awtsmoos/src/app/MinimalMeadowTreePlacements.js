// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreePlacements.js
 * @description Grows deterministic ecology-aware groves within first-play mobile and desktop budgets.
 * The Awtsmoos gathers species, ages, climates, and winds without choking the opening breath;
 * Awtsmoos.com keeps procedural shelter finite while remote canonical trees arrive after play begins.
 */

import { listTreePresets } from './MinimalMeadowTreeCoreFacade.js';
import {
	createMinimalMeadowTreeSpecification
} from './MinimalMeadowTreePlacementFactory.js';
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
const MOBILE_TREE_LIMIT = 22;
const DESKTOP_TREE_LIMIT = 32;

export function createMinimalMeadowTreePlacements(terrain, options = {}) {
	const presets = listTreePresets();
	if (!presets.length) {
		throw new Error('B"H | canonical procedural tree presets are unavailable.');
	}
	const groves = MINIMAL_MEADOW_GROVES.map((grove, groveIndex) => {
		return buildGrove(terrain, grove, groveIndex, presets);
	});
	const limit = options.mobile ? MOBILE_TREE_LIMIT : DESKTOP_TREE_LIMIT;
	return interleave(groves, limit).map((placement, index) => Object.freeze({
		...placement,
		id: `meadow-procedural-tree-${index + 1}`
	}));
}

function buildGrove(terrain, grove, groveIndex, presets) {
	const placements = [];
	const desired = grove.count + 3;
	for (let attempt = 0; attempt < 220 && placements.length < desired; attempt += 1) {
		const key = groveIndex * 211 + attempt;
		const radial = grove.radius * Math.sqrt(unit(key, 11));
		const angle = attempt * GOLDEN_ANGLE + unit(key, 23);
		const x = grove.x + Math.cos(angle) * radial;
		const z = grove.z + Math.sin(angle) * radial;
		if (!minimalMeadowPopulationAllows(x, z, 'tree')) continue;
		const specification = createMinimalMeadowTreeSpecification({
			grove,
			groveIndex,
			key,
			presets,
			terrain,
			x,
			z
		});
		if (!specification || !insidePlayableCrown(specification)) continue;
		if (!minimalMeadowHasSpacing(placements, x, z, 6.4)) continue;
		placements.push(specification);
	}
	return placements;
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
			if (!group[round] || output.length >= limit) continue;
			output.push(group[round]);
			added = true;
		}
		if (!added) break;
	}
	return output;
}

function unit(key, salt) {
	return minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, key, salt);
}
