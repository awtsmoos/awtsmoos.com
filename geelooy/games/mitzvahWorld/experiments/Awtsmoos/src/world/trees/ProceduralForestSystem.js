// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralForestSystem.js
 * @description Reveals one procedural-core forest through one renderer and collision covenant.
 * From one Etz Chaim the many species rise, each branch retaining its name;
 * one Heichal merges their material light, one ledger measures the flame.
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
	const reshimuHaStart = now();
	const sederHaPresets = listTreePresets();
	const kelimHaPolicies = createPolicies(sederHaPresets);
	const netivotHaPlacement = createForestPlacements(kelimHaPolicies, {
		groundSampler: options.groundSampler,
		halfSize: options.halfSize,
		obstacleTriangles: options.obstacleTriangles,
		roadTriangles: options.roadTriangles,
		seed: FOREST_SEED
	});
	if (netivotHaPlacement.placements.length !== kelimHaPolicies.length) {
		throw new Error(
			`Forest placement accepted ${netivotHaPlacement.placements.length}/${kelimHaPolicies.length} trees.`
		);
	}
	const nitzotzRecords = netivotHaPlacement.placements.map(buildForestRecord);
	const heichalHaRendering = createMergedForestGeometry(nitzotzRecords);
	const gevurotHaCollision = createForestColliders(nitzotzRecords);
	const olamHaForest = new Group();
	olamHaForest.name = 'Awtsmoos_single_core_generated_forest';
	olamHaForest.add(heichalHaRendering.group);
	const seferHaStats = createForestSystemStats({
		collision: gevurotHaCollision.stats,
		generationMilliseconds: now() - reshimuHaStart,
		placement: netivotHaPlacement,
		presetNames: sederHaPresets,
		records: nitzotzRecords,
		referenceSpecies: REFERENCE_TREE_SPECIES,
		rendering: heichalHaRendering.stats,
		seed: FOREST_SEED
	});
	seferHaStats.generatorAuthority = 'awtsmoos-procedural-core';
	olamHaForest.userData.AwtsmoosForest = seferHaStats;
	return {
		colliders: gevurotHaCollision.colliders,
		group: olamHaForest,
		records: nitzotzRecords,
		stats: seferHaStats
	};
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

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

export default createProceduralForest;
