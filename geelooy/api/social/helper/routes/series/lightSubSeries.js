//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module LightSubSeries
 * @description
 * The light child list for series navigation: ordered child identities plus
 * each child's own prateem (name + description) and nothing else. It never
 * opens a child's posts index, never merges the packed shard, and never
 * aggregates details — the heavy summary vessel (subSeriesSummaries.js)
 * stays available for callers that truly need counts, while navigation
 * lists stay cheap enough to answer under memory pressure.
 *
 * B"H 2026-11-11 (batch 29, user order): section pages rendered blank
 * because their only list source was the details aggregation, which the
 * read shed refuses under load. This reader is the names+descriptions
 * projection the user specced: one IDs read + one prateem read per child.
 *
 * B"H 2026-11-20 (residuals round): the projection now also carries
 * TRUTHFUL counts, because card renderers printed the empty posts /
 * subSeries arrays below as a false "0 posts" (a series with 3 posts
 * showed 0 on its parent's Explore card). Counts come only from cheap
 * sources that never enumerate a child's posts collection: the child's
 * own sub-series ID list (one IDs read, the same shape as the parent's)
 * and the packed all-posts grouped index (one cached, generation-
 * validated build shared with subSeriesSummaries), with the summaries
 * vessel's own legacy fallback (posts-node keys) for children the
 * index does not know — bounded by a cumulative per-request key
 * budget, so the batch-29 guarantee (navigation never becomes an
 * enumeration walk) still holds. A count that cannot be obtained
 * inside the budget is omitted — unknown, never a fabricated zero.
 */

const { getSubSeries } = require('../../index.js');
const { recoverSeriesPrateem } = require('../../series/seriesPrateemRecovery.js');
const { allPostsGrouped } = require('../../packed/allPostsIndex.js');

const MAX_PARALLEL_LIGHT = 8;

/**
 * Reads one child's prateem and projects it to the navigation card shape.
 * A child whose prateem cannot be read still appears, named by its id —
 * a truthful row beats a silently dropped section.
 */
async function readLightChild($i, heichelId, seriesId) {
	try {
		const result = await $i.db.get(`/social/heichelos/${heichelId}/series/${seriesId}/prateem`);
		const source = result && Object.prototype.hasOwnProperty.call(result, 'prateem')
			? result.prateem
			: result;
		const prateem = recoverSeriesPrateem(source, seriesId);
		if (!prateem) return { id: seriesId, title: seriesId };
		const child = {
			...prateem,
			id: prateem.id || seriesId,
			posts: [],
			subSeries: []
		};
		// The child's own sub-series ID list is one cheap IDs read (the
		// same shape the parent list itself came from) — a real count,
		// not an enumeration of anything below it.
		try {
			const subIds = await getSubSeries({
				$i,
				heichelId,
				parentSeriesId: seriesId,
				withDetails: false
			});
			if (Array.isArray(subIds)) child.subSeriesCount = subIds.length;
		} catch (_error) { /* count stays unknown, never fabricated */ }
		return child;
	} catch (_error) {
		return { id: seriesId, title: seriesId };
	}
}

/**
 * Returns the ordered light list for one parent series.
 * @returns {Promise<Array<{id:string, title?:string, name?:string, description?:string, posts: Array, subSeries: Array}>>}
 */
async function readLightSubSeries({ $i, heichelId, parentSeriesId }) {
	const ids = await getSubSeries({
		$i,
		heichelId,
		parentSeriesId,
		withDetails: false
	});
	if (!Array.isArray(ids) || !ids.length) return [];
	const results = new Array(ids.length);
	let cursor = 0;
	async function worker() {
		while (cursor < ids.length) {
			const index = cursor++;
			results[index] = await readLightChild($i, heichelId, String(ids[index]));
		}
	}
	const workerCount = Math.min(MAX_PARALLEL_LIGHT, ids.length);
	await Promise.all(Array.from({ length: workerCount }, worker));
	// Post counts with the summaries vessel's exact semantics: a child
	// covered by the packed grouped index counts its packed posts (one
	// cached build for the whole list); a child the index does not know
	// counts the keys of its legacy posts node — the same fallback
	// readSummaryDetail performs. The legacy fallback is budget-bounded
	// (a cumulative key cap per request) so a parent with many large
	// legacy children can never turn navigation into an enumeration
	// walk; children past the budget keep NO count — unknown, never a
	// fabricated zero.
	try {
		const grouped = allPostsGrouped({ $i, heichelId, seriesIds: ids.map(String) });
		for (let index = 0; index < results.length; index++) {
			const packed = grouped ? grouped.get(String(ids[index])) : null;
			if (Array.isArray(packed) && packed.length) {
				results[index].postsCount = packed.length;
			}
		}
	} catch (_error) { /* packed counts stay unknown, never fabricated */ }
	let legacyKeyBudget = 5000;
	for (let index = 0; index < results.length; index++) {
		if (results[index].postsCount !== undefined) continue;
		if (legacyKeyBudget <= 0) break;
		try {
			const keys = await $i.db.getObjectKeys(
				`/social/heichelos/${heichelId}/series/${String(ids[index])}/posts`
			);
			const list = keys && typeof keys === 'object' ? Object.keys(keys) : [];
			legacyKeyBudget -= list.length;
			results[index].postsCount = list.length;
		} catch (_error) { /* count stays unknown, never fabricated */ }
	}
	return results;
}

module.exports = { readLightSubSeries };
