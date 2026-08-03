// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralForestSystem.js
 * @description Reveals one quality-bounded forest through one renderer and collision covenant.
 * From one Etz Chaim the many species rise, each branch retaining its name;
 * Awtsmoos.com measures the vessel first, so mobile earth receives a living, lighter flame.
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
	const reshimuHaStart = now();
	const sederHaPresets = listTreePresets();
	const kelimHaBudget = forestQualityBudget(options.quality);
	const olamHaPopulation = createPolicies(
		sederHaPresets,
		REFERENCE_TREE_SPECIES,
		kelimHaBudget
	);
	const netivotHaPlacement = createForestPlacements(olamHaPopulation.policies, {
		groundSampler: options.groundSampler,
		halfSize: options.halfSize,
		obstacleTriangles: options.obstacleTriangles,
		roadTriangles: options.roadTriangles,
		seed: FOREST_SEED
	});
	assertCompletePlacement(netivotHaPlacement, olamHaPopulation.policies.length);
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
		presetNames: olamHaPopulation.presetNames,
		records: nitzotzRecords,
		referenceSpecies: olamHaPopulation.referenceSpecies,
		rendering: heichalHaRendering.stats,
		seed: FOREST_SEED
	});
	seferHaStats.generatorAuthority = 'awtsmoos-procedural-core';
	seferHaStats.quality = kelimHaBudget.name;
	seferHaStats.qualityBudget = Object.freeze({
		...kelimHaBudget,
		availablePresetCount: sederHaPresets.length,
		availableReferenceCount: REFERENCE_TREE_SPECIES.length
	});
	olamHaForest.userData.AwtsmoosForest = seferHaStats;
	return {
		colliders: gevurotHaCollision.colliders,
		group: olamHaForest,
		records: nitzotzRecords,
		stats: seferHaStats
	};
}

function createPolicies(presetNames, referenceSpecies, budget) {
	const selectedPresets = selectForestRepresentatives(presetNames, budget.presetCount);
	const selectedReferences = selectForestRepresentatives(
		referenceSpecies,
		budget.referenceCount
	);
	const presets = selectedPresets.map((name, index) => {
		return createForestPolicy(name, index);
	});
	const references = selectedReferences.map((species, offset) => {
		return createReferenceForestPolicy(species, presets.length + offset);
	});
	return {
		policies: [...presets, ...references],
		presetNames: selectedPresets,
		referenceSpecies: selectedReferences
	};
}

function assertCompletePlacement(placement, expectedCount) {
	if (placement.placements.length === expectedCount) return;
	throw new Error(
		`Forest placement accepted ${placement.placements.length}/${expectedCount} trees.`
	);
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

export default createProceduralForest;
