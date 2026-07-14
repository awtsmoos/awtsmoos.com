// B"H
// Boruch Hashem
// Blessed is He
/** @module QueryPlan @description Combines exact, vector, graph, permission, and ranking lanes explicitly. */

export const QUERY_LANES = Object.freeze([
	'exact-text',
	'source-range',
	'vector',
	'graph',
	'permissions',
	'radiance'
]);

/** Creates a deterministic hybrid-search query plan. */
export function createQueryPlan(input) {
	const query = String(input?.query || '').trim();
	if (!query) {
		throw new TypeError('Query plan requires a query.');
	}
	const lanes = [...new Set(input?.lanes || ['exact-text', 'vector'])];
	for (const lane of lanes) {
		if (!QUERY_LANES.includes(lane)) {
			throw new TypeError(`Unsupported query lane: ${lane}`);
		}
	}
	return Object.freeze({
		query,
		lanes: Object.freeze(lanes),
		filters: Object.freeze({ ...(input?.filters || {}) }),
		corpusPins: Object.freeze({ ...(input?.corpusPins || {}) }),
		limit: Math.max(1, Number(input?.limit || 25)),
		explain: input?.explain !== false
	});
}
