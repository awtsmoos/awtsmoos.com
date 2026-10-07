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

/** Reads one mapped Meluket post through the narrow record pipeline. */
async function readMappedPost(context) {
	return readSeriesPost(context, context.postId);
}

/**
 * Applies limit/offset pagination to an ordered id list.
 * Returns the original list when no pagination was requested.
 */
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

/**
 * Reads ordinary-series identities exactly once through public DosDB.
 * The historical function name remains part of the module contract, while
 * current DosDB already reconciles routed and legacy completeness internally.
 */
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

/** Resolves ordinary series details through one identity enumeration and bounded child reads. */
async function readUnmappedPosts(context) {
	const postIds = await readLegacyIds(context);
	const page = applyPagination(postIds, context.pagination);
	if (!context.withDetails) return page;
	return readRecordsByIds(context, page);
}

/** Chooses mapped or ordinary collection compatibility without exposing storage history. */
async function readPostsCompatible(context) {
	if (isMappedSeries(context.$i, context.seriesId)) return readMappedPosts(context);
	return readUnmappedPosts(context);
}

/**
 * Resolves one post narrow-first for every ordinary or mapped series.
 * Virtual series remain outside this function and retain route-level precedence.
 */
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
