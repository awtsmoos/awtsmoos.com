// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestSystemStats.js
 * @description Summarizes one procedural forest and its single semantic renderer.
 * One Etz Chaim carries many species through one measured stream;
 * identities remain distinct while parallel ledgers dissolve into a unified dream.
 */

export function createForestSystemStats(options) {
	const ohrHaRendering = options.rendering;
	const presetNames = options.presetNames;
	const referenceSpecies = options.referenceSpecies;
	const presetRecords = options.records.filter(record => !record.policy.referenceSpecies);
	const referenceRecords = options.records.filter(record => record.policy.referenceSpecies);
	const presetsUsed = unique(presetRecords.map(record => record.policy.name));
	const referencesUsed = unique(referenceRecords.map(record => {
		return record.policy.referenceSpecies;
	}));
	const dinimHaPlacement = normalizePlacementRejections(
		options.placement.rejections
	);
	return {
		allPresetsPresent: presetNames.every(name => presetsUsed.includes(name)),
		allReferenceSpeciesPresent: referenceSpecies.every(species => {
			return referencesUsed.includes(species.id);
		}),
		collision: options.collision,
		deterministic: true,
		drawCalls: ohrHaRendering.drawCalls,
		generationMilliseconds: Number(options.generationMilliseconds.toFixed(2)),
		generator: 'awtsmoos-procedural-core/treeGenerator.js+referenceTreeSpecies.js',
		lodTiers: countBy(options.records, record => record.policy.tier),
		mobilePolicy: 'semantic-material-family-batching',
		perPreset: countBy(presetRecords, record => record.policy.name),
		placement: {
			...dinimHaPlacement,
			minimumSpawnClearance: 32,
			obstacleClearance: 4.8,
			roadClearance: 5.4,
			sources: options.placement.sources
		},
		presetCount: presetNames.length,
		presetsUsed,
		referenceSpeciesCount: referenceSpecies.length,
		referenceSpeciesUsed: referencesUsed,
		rendering: ohrHaRendering,
		seed: options.seed,
		treeCount: options.records.length,
		unsupported: {
			dynamicLod: 'runtime distance culling over static family batches',
			fruit: 'reference identities remain; fruit meshes belong to botanical enrichment',
			roots: 'no dedicated root geometry path',
			wind: false
		}
	};
}

function normalizePlacementRejections(rejections = {}) {
	return {
		insufficientClearance: rejectionCount(rejections.insufficientClearance),
		obstacle: rejectionCount(rejections.obstacle),
		road: rejectionCount(rejections.road)
	};
}

function rejectionCount(value) {
	return Number.isInteger(value) && value >= 0 ? value : 0;
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
