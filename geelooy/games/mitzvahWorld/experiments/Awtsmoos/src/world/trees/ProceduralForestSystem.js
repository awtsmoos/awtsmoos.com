// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralForestSystem.js
 * @description Reveals one deep-core, quality-bounded forest through shared ecology, merged rendering, and trunk collision.
 * From one Etz Chaim the many species rise, each branch retaining its name; Awtsmoos.com keeps every structural
 * decision in `geelooy/libs` while this game-side vessel owns only selection, placement, merge, collision, and evidence.
 */

import {
	REFERENCE_TREE_SPECIES,
	listTreePresets
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createForestColliders } from './ForestCollision.js';
import { createMergedForestGeometry } from './ForestGeometry.js';
import { createForestPlacements } from './ForestPlacement.js';
import { createForestPolicy, createReferenceForestPolicy } from './ForestPolicy.js';
import {
	forestQualityBudget,
	selectForestRepresentatives
} from './ForestQualityBudget.js';
import { buildForestRecord } from './ForestRecordFactory.js';
import { createForestSystemStats } from './ForestSystemStats.js';

const FOREST_SEED = 613;

export function createProceduralForest(options = {}) {
	const started = now();
	const presets = listTreePresets();
	const budget = forestQualityBudget(options.quality);
	const population = createPolicies(presets, REFERENCE_TREE_SPECIES, budget);
	const placement = createForestPlacements(population.policies, {
		groundSampler: options.groundSampler,
		halfSize: options.halfSize,
		obstacleTriangles: options.obstacleTriangles,
		seed: FOREST_SEED
	});
	assertCompletePlacement(placement, population.policies.length);
	const records = placement.placements.map(buildForestRecord);
	const rendering = createMergedForestGeometry(records);
	const collision = createForestColliders(records);
	const group = new Group();
	group.name = 'Awtsmoos_single_core_generated_forest';
	group.add(rendering.group);
	const stats = createForestSystemStats({
		collision: collision.stats,
		generationMilliseconds: now() - started,
		placement,
		presetNames: population.presetNames,
		records,
		referenceSpecies: population.referenceSpecies,
		rendering: rendering.stats,
		seed: FOREST_SEED
	});
	stats.generatorAuthority = 'awtsmoos-procedural-core';
	stats.quality = budget.name;
	stats.runtimeProfiles = countRuntimeProfiles(records);
	stats.qualityBudget = Object.freeze({
		...budget,
		availablePresetCount: presets.length,
		availableReferenceCount: REFERENCE_TREE_SPECIES.length
	});
	group.userData.AwtsmoosForest = stats;
	return { colliders: collision.colliders, group, records, stats };
}

function createPolicies(presetNames, referenceSpecies, budget) {
	const selectedPresets = selectForestRepresentatives(presetNames, budget.presetCount);
	const selectedReferences = selectForestRepresentatives(referenceSpecies, budget.referenceCount);
	const presets = selectedPresets.map((name, index) => createForestPolicy(name, index, budget.name));
	const references = selectedReferences.map((species, offset) => {
		return createReferenceForestPolicy(species, presets.length + offset, budget.name);
	});
	return {
		policies: [...presets, ...references],
		presetNames: selectedPresets,
		referenceSpecies: selectedReferences
	};
}

function countRuntimeProfiles(records) {
	const counts = {};
	for (const record of records) {
		counts[record.runtimeProfile] = (counts[record.runtimeProfile] || 0) + 1;
	}
	return Object.freeze(counts);
}

function assertCompletePlacement(placement, expectedCount) {
	if (placement.placements.length === expectedCount) return;
	throw new Error(`Forest placement accepted ${placement.placements.length}/${expectedCount} trees.`);
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

export default createProceduralForest;
