//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file subSeriesSummaries.js
 * @description
 * The Awtsmoos gathers child identity, post count, and branch count behind one
 * HTTP request, removing the browser's historical N+1 series-details waterfall.
 */

const {
	getSeries,
	getSubSeries
} = require('../../index.js');

const MAX_PARALLEL_SUMMARIES = 6;

/** Returns an ordered array for either legacy arrays or keyed collection maps. */
function identities(value) {
	if (Array.isArray(value)) return value;
	if (value && typeof value === 'object') return Object.keys(value);
	return [];
}

/** Converts one canonical getSeries result into the browser's compact card shape. */
function summarize(detail, requestedId) {
	if (!detail || detail.error) {
		return { id: requestedId, error: 'Details not found' };
	}
	const prateem = detail.prateem || detail;
	const posts = identities(detail.posts);
	const subSeries = identities(detail.subSeries);
	return {
		...prateem,
		id: prateem.id || requestedId,
		posts,
		subSeries,
		postsCount: posts.length,
		subSeriesCount: subSeries.length
	};
}

/**
 * Reads child detail vessels with finite parallelism while preserving ID order.
 * @param {object} context Active request identity and ordered child IDs.
 * @returns {Promise<object[]>} Ordered card summaries.
 */
async function readSummaries({ $i, heichelId, ids }) {
	const results = new Array(ids.length);
	let cursor = 0;
	async function worker() {
		while (cursor < ids.length) {
			const index = cursor++;
			const seriesId = ids[index];
			try {
				const detail = await getSeries({
					$i,
					heichelId,
					seriesId,
					withDetails: true
				});
				results[index] = summarize(detail, seriesId);
			} catch (_error) {
				results[index] = summarize(null, seriesId);
			}
		}
	}
	await Promise.all(
		Array.from(
			{ length: Math.min(MAX_PARALLEL_SUMMARIES, ids.length) },
			worker
		)
	);
	return results;
}

/**
 * Resolves child IDs once and returns summary-ready records in one HTTP vessel.
 * @param {object} context Active request, Heichel id, and parent series id.
 * @returns {Promise<object[]>} Child summaries suitable for immediate rendering.
 */
async function readSubSeriesSummaries({ $i, heichelId, parentSeriesId }) {
	const ids = await getSubSeries({
		$i,
		heichelId,
		parentSeriesId,
		withDetails: false
	});
	if (!Array.isArray(ids) || !ids.length) return [];
	return readSummaries({ $i, heichelId, ids });
}

module.exports = {
	MAX_PARALLEL_SUMMARIES,
	identities,
	readSubSeriesSummaries,
	readSummaries,
	summarize
};
