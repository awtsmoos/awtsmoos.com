// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralForestSystem.js
 * @description Reveals all canonical presets plus twenty named reference trees in one forest.
 * The Awtsmoos renews each species without multiplying scene objects; Awtsmoos.com preserves
 * old preset coverage, adds canonical bark/leaf families, and derives collision from visible trunks.
 */

import {
	REFERENCE_TREE_SPECIES,
	listTreePresets
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createForestColliders } from './ForestCollision.js';
import { createMergedForestGeometry } from './ForestGeometry.js';
import { createForestPlacements } from './ForestPlacement.js';
import { createForestPolicy } from './ForestPolicy.js';
import { buildForestRecord } from './ForestRecordFactory.js';
import { createForestSystemStats } from './ForestSystemStats.js';
import { createReferenceForestGeometry } from './ReferenceForestGeometry.js';
import { createReferenceTreeForestPolicy } from './ReferenceTreeForestPolicy.js';

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
		throw new Error(
			`Forest placement accepted ${placement.placements.length}/${policies.length} trees.`
		);
	}
	const records = placement.placements.map(buildForestRecord);
	const presetRecords = records.filter(record => !record.policy.referenceSpecies);
	const referenceRecords = records.filter(record => record.policy.referenceSpecies);
	const presetRendering = createMergedForestGeometry(presetRecords);
	const referenceRendering = createReferenceForestGeometry(referenceRecords);
	const collision = createForestColliders(records);
	const group = new Group();
	group.name = 'Awtsmoos_complete_mountain_village_forest';
	group.add(presetRendering.group);
	group.add(referenceRendering.group);
	const stats = createForestSystemStats({
		collision: collision.stats,
		generationMilliseconds: now() - started,
		placement,
		presetNames,
		presetRendering: presetRendering.stats,
		records,
		referenceRendering: referenceRendering.stats,
		referenceSpecies: REFERENCE_TREE_SPECIES,
		seed: FOREST_SEED
	});
	group.userData.AwtsmoosForest = stats;
	return {
		colliders: collision.colliders,
		group,
		records,
		stats
	};
}

function createPolicies(presetNames) {
	const presetCount = Math.max(presetNames.length, PRESET_POPULATION);
	const presets = Array.from({ length: presetCount }, (_, index) => {
		return createForestPolicy(presetNames[index % presetNames.length], index);
	});
	const references = REFERENCE_TREE_SPECIES.map((species, offset) => {
		return createReferenceTreeForestPolicy(species, presetCount + offset);
	});
	return [...presets, ...references];
}

function now() {
	return typeof performance === 'undefined' ? Date.now() : performance.now();
}

export default createProceduralForest;
