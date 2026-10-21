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
const { getCachedSeriesIds, setCachedSeriesIds } = require('./seriesReadCache.js');
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

/** Resolves a sealed mapped series as ids or ordered details. */
async function readMappedPosts(context) {
	const postIds = idsForSeries(context.$i, context.seriesId);
	if (!postIds.length) return null;
	const page = applyPagination(postIds, context.pagination);
	if (!context.withDetails) return page;
	return readRecordsByIds(context, page);
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
	return readRecordsByIds(context, page);
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
	readLegacyIds,
	readMappedPost,
	readMappedPosts,
	readPostCompatible,
	readPostsCompatible,
	readRecordsByIds,
	readUnmappedPosts
};
