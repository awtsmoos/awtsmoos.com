//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module SeriesReadCompatibility
 * @description
 * The Awtsmoos lets Awtsmoos.com read one reconciled series identity vessel once,
 * then reveals bounded child records without repeating a cold routed collection scan.
 */

const { idsForSeries, isMappedSeries } = require('./meluketSeriesMap.js');
const {
	postsPath,
	readRecordsByIds,
	readSeriesPost
} = require('./seriesRecordReader.js');
const {
	getCachedSeriesIds,
	setCachedSeriesIds,
	getCachedSeriesDetails,
	setCachedSeriesDetails
} = require('./seriesReadCache.js');
const { allPostsGrouped } = require('../packed/allPostsIndex.js');
const { safeRecordRead } = require('../safeguards/safeRecordRead.js');

/** Reads one mapped Meluket post through the narrow record pipeline. */
async function readMappedPost(context) {
	return readSeriesPost(context, context.postId);
}

/** Applies limit/offset pagination to an ordered id list. */
function applyPagination(ids, pagination) {
	if (!pagination) return ids;
	const offset = pagination.offset || 0;
	if (pagination.limit === null || pagination.limit === undefined) {
		return offset > 0 ? ids.slice(offset) : ids;
	}
	return ids.slice(offset, offset + pagination.limit);
}

/**
 * Builds the details-memo key for one page: an FNV-1a hash over the exact
 * ordered page identities plus the stable property signature, so two
 * different pages or projections can never share a memo entry.
 */
function detailsPageKey(context, page) {
	const properties = context.properties && typeof context.properties === 'object'
		? Object.keys(context.properties).sort()
			.map(k => `${k}=${JSON.stringify(context.properties[k])}`).join('&')
		: '';
	const material = `${page.join('|')}#${properties}`;
	let hash = 0x811c9dc5;
	for (let i = 0; i < material.length; i++) {
		hash ^= material.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return `${page.length}:${hash.toString(36)}`;
}

/** Reads one details page through the bounded memo, filling it on a miss. */
async function readDetailsPage(context, page) {
	const pageKey = detailsPageKey(context, page);
	const memo = getCachedSeriesDetails(context.heichelId, context.seriesId, pageKey);
	if (memo) return memo;
	const records = await readRecordsByIds(context, page);
	setCachedSeriesDetails(context.heichelId, context.seriesId, pageKey, records);
	return records;
}

/** Resolves a sealed mapped series as ids or ordered details. */
async function readMappedPosts(context) {
	const postIds = idsForSeries(context.$i, context.seriesId);
	if (!postIds.length) return null;
	const page = applyPagination(postIds, context.pagination);
	if (!context.withDetails) return page;
	return readDetailsPage(context, page);
}

/** Reads ordinary-series identities exactly once through public DosDB. */
async function readLegacyIds(context) {
	const cached = getCachedSeriesIds(context.heichelId, context.seriesId);
	if (cached) return cached;
	const result = await context.$i.db
		.getObjectKeys(postsPath(context.heichelId, context.seriesId))
		.catch(() => []);
	const ids = Array.isArray(result) ? result : [];
	setCachedSeriesIds(context.heichelId, context.seriesId, ids);
	return ids;
}

/** Reads packed-shard post ids for one series; a poison packed read degrades to legacy-only. */
async function readPackedIds(context) {
	const sid = String(context.seriesId);
	const groups = await safeRecordRead(
		'packed:allPostsGrouped:' + context.heichelId + ':' + sid,
		() => allPostsGrouped({ $i: context.$i, heichelId: context.heichelId, seriesIds: [sid] }),
		{ fallback: new Map(), tag: 'seriesReadCompatibility' });
	return (groups.get(sid) || [])
		.map(compact => String(compact?.postId || ''))
		.filter(Boolean);
}

/** Resolves ordinary series details through one identity enumeration and bounded child reads. */
async function readUnmappedPosts(context) {
	const legacyIds = await readLegacyIds(context);
	const packedIds = await readPackedIds(context);
	const seen = new Set(legacyIds.map(String));
	const postIds = [...legacyIds, ...packedIds.filter(id => !seen.has(id))];
	const page = applyPagination(postIds, context.pagination);
	if (!context.withDetails) return page;
	return readDetailsPage(context, page);
}

/** Chooses mapped or ordinary collection compatibility without exposing storage history. */
async function readPostsCompatible(context) {
	if (isMappedSeries(context.$i, context.seriesId)) return readMappedPosts(context);
	return readUnmappedPosts(context);
}

/** Resolves one post narrow-first for every ordinary or mapped series. */
async function readPostCompatible(context) {
	const record = await readSeriesPost(context, context.postId);
	return record || context.standardReader();
}

module.exports = {
	applyPagination,
	detailsPageKey,
	readDetailsPage,
	readLegacyIds,
	readMappedPost,
	readMappedPosts,
	readPostCompatible,
	readPostsCompatible,
	readRecordsByIds,
	readUnmappedPosts
};
