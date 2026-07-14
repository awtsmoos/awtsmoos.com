// B"H
// Boruch Hashem
// Blessed is He
/** @module DiversityAdjustment @description Diversifies results by context without hiding raw relevance. */

/** Applies explicit repeat penalties while preserving raw scores. */
export function applyDiversityAdjustment(items, options = {}) {
	const facets = options.facets || ['owner', 'heichelId', 'type'];
	const penalty = Math.max(0, Number(options.repeatPenalty || 0.08));
	const seen = new Map();
	return items.map(item => {
		let adjustment = 0;
		for (const facet of facets) {
			const value = item[facet];
			if (!value) {
				continue;
			}
			const key = `${facet}:${value}`;
			const repeats = seen.get(key) || 0;
			adjustment -= repeats * penalty;
			seen.set(key, repeats + 1);
		}
		return Object.freeze({
			...item,
			rawScore: Number(item.score || 0),
			diversityAdjustment: Number(adjustment.toFixed(6)),
			score: Number(Math.max(0, Number(item.score || 0) + adjustment).toFixed(6))
		});
	});
}
