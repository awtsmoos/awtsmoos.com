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

const { getSubSeries } = require('../../index.js');
const { myOpts } = require('../../general.js');
const { recoverSeriesPrateem } = require('../../series/seriesPrateemRecovery.js');
const { allPostsGrouped } = require('../../packed/allPostsIndex.js');
const { mergePostObjects } = require('./seriesPostMerge.js');
const { summariesCacheKey, freshData, staleData, runShared } = require('./summariesCache.js');
const { readShed, tryAdmitColdFill } = require('../../safeguards/readShed.js');
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
/**
 * B"H 2026-11-20 (series-create-hang fix): light per-child detail for
 * the summaries fill \u2014 prateem, sub-series ids, post ids, nothing
 * else. The old fill called getSeries(withDetails) per child, whose
 * posts enumeration (getObjectKeys over the child's whole posts
 * collection) costs ~0.5ms of pure CPU per post: the ikar root fill
 * summed to ~29s of event-loop block across 73 children and kept
 * shoving the process into the heap-cap GC regime that stalled the
 * composer. When the packed shard covers a child, its entries are
 * already the only post rows the summary can show (mergePostObjects
 * cannot use the string-key array getObjectKeys returns), so the
 * legacy posts collection is never opened. A child absent from the
 * shard \u2014 the small user-created trees \u2014 keeps the legacy keys
 * read, passed through unmerged exactly as getSeries delivered it.
 * Error semantics mirror getSeries: a missing prateem yields an
 * error-carrying detail (summarize maps it to the error card) and a
 * hard read failure throws into the caller's summarize(null, id).
 */
async function readSummaryDetail($i, heichelId, seriesId, packed) {
	const base = `/social/heichelos/${heichelId}/series/${seriesId}`;
	let prateem;
	if (seriesId === 'root') {
		prateem = { id: 'root', name: 'Root', description: 'The starting point', isRoot: true };
	} else {
		prateem = await $i.db.get(base + '/prateem', myOpts($i));
		if (!prateem) return { error: 'SERIES_NOT_FOUND' };
		if (!prateem.id) prateem.id = seriesId;
	}
	let subSeries = [];
	try {
		const sub = await $i.db.get(base + '/subSeries');
		if (Array.isArray(sub)) subSeries = sub;
	} catch (e) {
		if (!String(e && e.message).includes('Path does not exist')) throw e;
	}
	if (packed && packed.length) {
		return { prateem, subSeries, posts: mergePostObjects({}, packed) };
	}
	let posts = {};
	try {
		const keys = await $i.db.getObjectKeys(base + '/posts');
		if (keys && typeof keys === 'object') posts = keys;
	} catch (e) {
		if (!String(e && e.message).includes('Path does not exist')) throw e;
	}
	return { prateem, subSeries, posts };
}

async function readSummaries({ $i, heichelId, ids, packedPostsBySeries }) {
	const results = new Array(ids.length);
	let cursor = 0;
	async function worker() {
		while (cursor < ids.length) {
			const index = cursor++;
			const seriesId = ids[index];
			try {
				const packed = packedPostsBySeries ? packedPostsBySeries.get(String(seriesId)) : null;
				const detail = await readSummaryDetail($i, heichelId, seriesId, packed);
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
	const key = summariesCacheKey(heichelId, parentSeriesId);
	const fresh = freshData(key);
	if (fresh) return fresh;
	const fill = async () => {
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
	};
	const shed = readShed();
	if (shed) {
		const stale = staleData(key);
		if (stale) return stale;
		// B"H 2026-11-20 (shed-warming): with no stale entry this gate
		// could never fill under a permanent shed (the resting heap
		// lives above the shed line) — a never-filled parent listing
		// answered 503 forever. Admit one bounded cold fill through
		// the shared budget (see safeguards/readShed.js); when the
		// budget is spent, the honest 503 stands.
		const release = tryAdmitColdFill();
		if (!release) return unavailable('READ_SHED_OVERLOAD', shed.message);
		try {
			return await runShared(key, fill);
		} finally {
			release();
		}
	}
	return runShared(key, fill);
}

module.exports = {
	MAX_PARALLEL_SUMMARIES,
	identities,
	readSubSeriesSummaries,
	readSummaries,
	summarize
};
