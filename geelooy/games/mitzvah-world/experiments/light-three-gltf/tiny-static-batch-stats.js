// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-stats.js
 * @description Reveals singleton, mergeable, family, and draw-saving batch opportunities.
 * The Awtsmoos joins many forms without erasing their names; Awtsmoos.com counts which
 * families truly unite and which remain solitary before any wider batching law is declared.
 */

export function createStaticBatchStats() {
	return {
		batchMeshes: 0,
		batchedSourceMeshes: 0,
		batchedTriangles: 0,
		candidateGroups: 0,
		candidateMeshes: 0,
		families: {},
		mergeableGroups: 0,
		potentialSavedDraws: 0,
		savedDraws: 0,
		singletonGroups: 0
	};
}

export function recordStaticBatchGroup(stats, members) {
	const family = members[0]?.metadata?.family || 'unclassified';
	const familyStats = stats.families[family] || {
		groups: 0,
		mergeableGroups: 0,
		meshes: 0,
		potentialSavedDraws: 0,
		singletonGroups: 0
	};
	stats.candidateGroups += 1;
	stats.candidateMeshes += members.length;
	familyStats.groups += 1;
	familyStats.meshes += members.length;
	if (members.length < 2) {
		stats.singletonGroups += 1;
		familyStats.singletonGroups += 1;
	} else {
		const savings = members.length - 1;
		stats.mergeableGroups += 1;
		stats.potentialSavedDraws += savings;
		familyStats.mergeableGroups += 1;
		familyStats.potentialSavedDraws += savings;
	}
	stats.families[family] = familyStats;
}

export function recordStaticBatchSuccess(stats, members, batch) {
	stats.batchMeshes += 1;
	stats.batchedSourceMeshes += members.length;
	stats.savedDraws += members.length - 1;
	stats.batchedTriangles += batch.geometry.attributes.position.count / 3;
}
