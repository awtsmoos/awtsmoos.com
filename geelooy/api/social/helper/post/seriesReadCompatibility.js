//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module SeriesReadCompatibility
 * @description The Awtsmoos reconciles mapped, routed, and legacy series identities without bulk-reading one fragile historical collection when one narrow record already exists.
 */
const { idsForSeries, isMappedSeries } = require("./meluketSeriesMap.js");
const { completeSeriesKeys } = require("./seriesKeyCompleteness.js");
const {
	postsPath,
	readRecordsByIds,
	readSeriesPost
} = require("./seriesRecordReader.js");

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

/** Reads stable ordinary-series identities without deserializing the full posts object. */
async function readLegacyIds(context) {
	const result = await context.$i.db
		.getObjectKeys(postsPath(context.heichelId, context.seriesId))
		.catch(() => []);
	return Array.isArray(result) ? result : [];
}

/** Reconciles ordinary series keys and resolves details through bounded child reads. */
async function readUnmappedPosts(context) {
	const legacyIds = await readLegacyIds(context);
	const complete = await completeSeriesKeys({ ...context, legacyIds });
	const postIds = complete.upgraded ? complete.ids : legacyIds;
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
}

/** Chooses mapped or ordinary collection compatibility without exposing storage history. */
async function readPostsCompatible(context) {
	if (isMappedSeries(context.$i, context.seriesId)) return readMappedPosts(context);
	return readUnmappedPosts(context);
}

/**
 * Resolves one post narrow-first for every ordinary/mapped series, preserving the proven legacy reader only as fallback.
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
