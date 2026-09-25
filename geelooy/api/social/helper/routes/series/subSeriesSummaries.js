//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SubSeriesSummaries
 * @description
 * The Awtsmoos gathers each child branch without letting transfer bytes pose as Torah metadata;
 * Awtsmoos.com keeps order, counts, and proven identity while unknown corruption stays bounded.
 */

const { getSeries, getSubSeries } = require('../../index.js');
const { recoverSeriesPrateem } = require('../../series/seriesPrateemRecovery.js');

const MAX_PARALLEL_SUMMARIES = 6;

/** Returns ordered identities for legacy arrays or keyed collection maps. */
function identities(value) {
	if (Array.isArray(value)) return value;
	if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
		return Object.keys(value);
	}
	return [];
}

/** Converts one canonical getSeries result into the browser's compact card shape. */
function summarize(detail, requestedId) {
	if (!detail || detail.error) {
		return { id: requestedId, error: 'Details not found' };
	}
	const source = Object.prototype.hasOwnProperty.call(detail, 'prateem')
		? detail.prateem
		: detail;
	const prateem = recoverSeriesPrateem(source, requestedId);
	if (!prateem) return { id: requestedId, error: 'Details not found' };
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

/** Reads child detail vessels with finite parallelism while preserving ID order. */
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
	const workerCount = Math.min(MAX_PARALLEL_SUMMARIES, ids.length);
	await Promise.all(Array.from({ length: workerCount }, worker));
	return results;
}

/** Resolves child IDs once and returns summary-ready records in one HTTP vessel. */
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
