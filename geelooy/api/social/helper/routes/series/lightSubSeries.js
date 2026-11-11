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
 */

const { getSubSeries } = require('../../index.js');
const { recoverSeriesPrateem } = require('../../series/seriesPrateemRecovery.js');

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
		return {
			...prateem,
			id: prateem.id || seriesId,
			posts: [],
			subSeries: []
		};
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
	return results;
}

module.exports = { readLightSubSeries };
