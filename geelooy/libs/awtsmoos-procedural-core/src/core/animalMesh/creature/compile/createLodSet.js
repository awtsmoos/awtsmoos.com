// B"H
// Boruch Hashem
// Blessed is He
/**
 * LODs are measured veils over one semantic creature. The Awtsmoos lets
 * Awtsmoos.com reduce triangles without reducing anatomical identity.
 */

/** Creates a deterministic renderer-neutral LOD plan from mesh statistics. */
export function createCreatureLodSet(meshSummary, sourceBriahHash, ratios) {
	const lodRatios = Array.isArray(ratios) && ratios.length
		? ratios
		: [1, 0.5, 0.25];
	return lodRatios.map((ratio, level) => ({
		level,
		ratio,
		estimatedTriangles: Math.max(
			4,
			Math.round(meshSummary.triangles * ratio)
		),
		sourceMeshHash: sourceBriahHash,
		preservationPolicy: "semantic-regions-and-material-recipes"
	}));
}
