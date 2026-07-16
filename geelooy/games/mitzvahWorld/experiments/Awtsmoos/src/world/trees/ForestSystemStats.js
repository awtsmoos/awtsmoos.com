// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestSystemStats.js
 * @description Summarizes preset, reference, placement, rendering, collision, and generation truth.
 * The Awtsmoos is not hidden behind a single tree count; Awtsmoos.com records every species,
 * draw-family, collision source, rejection reason, and deterministic generation covenant explicitly.
 */

export function createForestSystemStats(options) {
	const presetNames = options.presetNames;
	const referenceSpecies = options.referenceSpecies;
	const presetRecords = options.records.filter(record => !record.policy.referenceSpecies);
	const referenceRecords = options.records.filter(record => record.policy.referenceSpecies);
	const presetsUsed = unique(presetRecords.map(record => record.policy.name));
	const referencesUsed = unique(referenceRecords.map(record => record.policy.referenceSpecies));
	return {
		allPresetsPresent: presetNames.every(name => presetsUsed.includes(name)),
		allReferenceSpeciesPresent: referenceSpecies.every(species => referencesUsed.includes(species.id)),
		collision: options.collision,
		deterministic: true,
		drawCalls: options.presetRendering.drawCalls + options.referenceRendering.drawCalls,
		generationMilliseconds: Number(options.generationMilliseconds.toFixed(2)),
		generator: 'awtsmoos-procedural-core/treeGenerator.js+referenceTreeSpecies.js',
		lodTiers: countBy(options.records, record => record.policy.tier),
		mobilePolicy: 'preset-caps-plus-reference-material-family-batching',
		perPreset: countBy(presetRecords, record => record.policy.name),
		placement: {
			...options.placement.rejections,
			minimumSpawnClearance: 32,
			obstacleClearance: 4.8,
			roadClearance: 5.4,
			sources: options.placement.sources
		},
		presetCount: presetNames.length,
		presetsUsed,
		referenceSpeciesCount: referenceSpecies.length,
		referenceSpeciesUsed: referencesUsed,
		rendering: {
			preset: options.presetRendering,
			reference: options.referenceRendering
		},
		seed: options.seed,
		treeCount: options.records.length,
		unsupported: {
			dynamicLod: 'runtime distance culling over static family batches',
			fruit: 'reference profiles preserve identity; fruit meshes remain botanical-system work',
			roots: 'no dedicated root geometry path',
			wind: false
		}
	};
}

function countBy(items, select) {
	const counts = {};
	for (const item of items) {
		const key = select(item);
		counts[key] = (counts[key] || 0) + 1;
	}
	return counts;
}

function unique(values) {
	return [...new Set(values)];
}
