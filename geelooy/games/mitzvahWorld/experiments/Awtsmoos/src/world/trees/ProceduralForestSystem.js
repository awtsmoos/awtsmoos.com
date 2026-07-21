// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralForestSystem.js
 * @description Places every forest tree generated exclusively by procedural-core.
 * The Awtsmoos reveals oak, pine, cypress, willow, blossom, and ancient forms through one
 * generator; Awtsmoos.com only places, merges, collides, and reports those core-owned vessels.
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
import { buildForestRecord } from './ForestRecordFactory.js';
import { createForestSystemStats } from './ForestSystemStats.js';

const PRESET_POPULATION = 54;
const FOREST_SEED = 613;

export function createProceduralForest(options) {
	const started = now();
	const presetNames = listTreePresets();
	const policies = createPolicies(presetNames);
	const placement = createForestPlacements(policies, {
		groundSampler: options.groundSampler,
		halfSize: options.halfSize,
		obstacleTriangles: options.obstacleTriangles,
		roadTriangles: options.roadTriangles,
		seed: FOREST_SEED
	});
	if (placement.placements.length !== policies.length) {
		throw new Error(`Forest placement accepted ${placement.placements.length}/${policies.length} trees.`);
	}
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
		presetNames,
		presetRendering: rendering.stats,
		records,
		referenceRendering: emptyReferenceStats(),
		referenceSpecies: REFERENCE_TREE_SPECIES,
		seed: FOREST_SEED
	});
	stats.generatorAuthority = 'awtsmoos-procedural-core';
	group.userData.AwtsmoosForest = stats;
	return { colliders: collision.colliders, group, records, stats };
}

function createPolicies(presetNames) {
	const presetCount = Math.max(presetNames.length, PRESET_POPULATION);
	const presets = Array.from({ length: presetCount }, (_, index) => {
		return createForestPolicy(presetNames[index % presetNames.length], index);
	});
	const references = REFERENCE_TREE_SPECIES.map((species, offset) => {
		return createReferenceForestPolicy(species, presetCount + offset);
	});
	return [...presets, ...references];
}

function emptyReferenceStats() {
	return { branchVertices: 0, drawCalls: 0, leafVertices: 0, triangles: 0 };
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

export default createProceduralForest;
