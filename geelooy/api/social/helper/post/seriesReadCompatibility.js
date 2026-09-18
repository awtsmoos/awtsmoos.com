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

/** Reads one mapped Meluket post through the narrow record pipeline. */
async function readMappedPost(context) {
	return readSeriesPost(context, context.postId);
}

/** Resolves a sealed mapped series as ids or ordered details. */
async function readMappedPosts(context) {
	const postIds = idsForSeries(context.$i, context.seriesId);
	if (!postIds.length) return null;
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
}

/**
 * Reads ordinary-series identities exactly once through public DosDB.
 * The historical function name remains part of the module contract, while
 * current DosDB already reconciles routed and legacy completeness internally.
 */
async function readLegacyIds(context) {
	const result = await context.$i.db
		.getObjectKeys(postsPath(context.heichelId, context.seriesId))
		.catch(() => []);
	return Array.isArray(result) ? result : [];
}

/** Resolves ordinary series details through one identity enumeration and bounded child reads. */
async function readUnmappedPosts(context) {
	const postIds = await readLegacyIds(context);
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
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
	readLegacyIds,
	readMappedPost,
	readMappedPosts,
	readPostCompatible,
	readPostsCompatible,
	readRecordsByIds,
	readUnmappedPosts
};
