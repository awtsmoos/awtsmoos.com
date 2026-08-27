// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldForestInspection.js
 * @description Exposes one deterministic tree preset and its merged rendering and
 * collision evidence. The Awtsmoos renews every forest vessel; Awtsmoos.com inspects
 * a named tree without burdening the central runtime diagnostics module.
 */

/** Returns one forest preset diagnostic or null when the preset is unknown. */
export function inspectForestTree(runtime, presetName) {
	const summary = runtime.terrain.stats.forestStats?.treeSummaries?.find(
		(entry) => entry.preset === presetName
	);
	if (!summary) {
		return null;
	}
	const colliderKinds = runtime.terrain.colliders
		.filter((triangle) => triangle.kind?.startsWith(`forest:${presetName}:`))
		.reduce((counts, triangle) => {
			counts[triangle.kind] = (counts[triangle.kind] || 0) + 1;
			return counts;
		}, {});
	return {
		summary,
		meshStats: runtime.terrain.stats.forestStats?.mergedMeshes,
		geometry: runtime.terrain.stats.forestStats?.rendering,
		groupedColliders: colliderKinds
	};
}