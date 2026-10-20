//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SubSeriesSummaries
 * @description Ordered child-branch summaries; the cache vessel
 * lives in ./summariesCache.js. B"H 2026-10-20 (safeguards ph.2):
 * freshness by TTL check, never a writer clear. Under a read shed
 * a cold caller gets stale data or a 503 — never a scan stampede.
 */

const { getSeries, getSubSeries } = require('../../index.js');
const { recoverSeriesPrateem } = require('../../series/seriesPrateemRecovery.js');
const { allPostsGrouped } = require('../../packed/allPostsIndex.js');
const { mergePostObjects } = require('./seriesPostMerge.js');
const { summariesCacheKey, freshData, staleData, runShared } = require('./summariesCache.js');
const { readShed } = require('../../safeguards/readShed.js');
const { unavailable } = require('../apiHttp.js');

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
async function readSummaries({ $i, heichelId, ids, packedPostsBySeries }) {
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
				const packed = packedPostsBySeries ? packedPostsBySeries.get(String(seriesId)) : null;
				const merged = packed && packed.length
					? { ...detail, posts: mergePostObjects(detail && detail.posts, packed) }
					: detail;
				results[index] = summarize(merged, seriesId);
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
	const key = summariesCacheKey(heichelId, parentSeriesId);
	const fresh = freshData(key);
	if (fresh) return fresh;
	const shed = readShed();
	if (shed) {
		const stale = staleData(key);
		if (stale) return stale;
		return unavailable('READ_SHED_OVERLOAD', shed.message);
	}
	return runShared(key, async () => {
		const ids = await getSubSeries({
			$i,
			heichelId,
			parentSeriesId,
			withDetails: false
		});
		if (!Array.isArray(ids) || !ids.length) return [];
		let packedPostsBySeries = null;
		try {
			packedPostsBySeries = allPostsGrouped({ $i, heichelId, seriesIds: ids.map(String) });
		} catch (_error) {
			packedPostsBySeries = null;
		}
		return await readSummaries({ $i, heichelId, ids, packedPostsBySeries });
	});
}

module.exports = {
	MAX_PARALLEL_SUMMARIES,
	identities,
	readSubSeriesSummaries,
	readSummaries,
	summarize
};
