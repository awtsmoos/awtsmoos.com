//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesReadCompatibility
 * @description
 * The Awtsmoos reconciles mapped, routed, and legacy series identities without
 * bulk-reading one fragile historical collection when detailed records are needed.
 */

const { idsForSeries, isMappedSeries } = require("./meluketSeriesMap.js");
const { completeSeriesKeys } = require("./seriesKeyCompleteness.js");
const {
	postsPath,
	readRecordsByIds,
	readSeriesPost
} = require("./seriesRecordReader.js");

/**
 * Reads a mapped Meluket post through the narrow record pipeline.
 * @param {object} context Canonical route reader context.
 * @returns {Promise<object|null>} Projected post record or null.
 */
async function readMappedPost(context) {
	return readSeriesPost(context, context.postId);
}

/**
 * Resolves a sealed mapped series as ids or ordered details.
 * @param {object} context Canonical route reader context.
 * @returns {Promise<string[]|object[]|null>} Mapped result.
 */
async function readMappedPosts(context) {
	const postIds = idsForSeries(context.$i, context.seriesId);
	if (!postIds.length) return null;
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
}

/**
 * Reads stable series identities without deserializing the full posts object.
 * @param {object} context Canonical route reader context.
 * @returns {Promise<string[]>} Ordered identities or an empty list.
 */
async function readLegacyIds(context) {
	const result = await context.$i.db
		.getObjectKeys(postsPath(context.heichelId, context.seriesId))
		.catch(() => []);
	return Array.isArray(result) ? result : [];
}

/**
 * Reconciles ordinary series keys and resolves details through bounded child reads.
 * @param {object} context Canonical route reader context.
 * @returns {Promise<string[]|object[]>} Stable identities or ordered details.
 */
async function readUnmappedPosts(context) {
	const legacyIds = await readLegacyIds(context);
	const complete = await completeSeriesKeys({ ...context, legacyIds });
	const postIds = complete.upgraded ? complete.ids : legacyIds;
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
}

/** Chooses mapped or ordinary compatibility without exposing storage history. */
async function readPostsCompatible(context) {
	if (isMappedSeries(context.$i, context.seriesId)) return readMappedPosts(context);
	return readUnmappedPosts(context);
}

/**
 * Resolves one post while retaining the proven ordinary reader as final fallback.
 * @param {object} context Canonical route reader context.
 * @returns {Promise<object>} Resolved post result.
 */
async function readPostCompatible(context) {
	if (!isMappedSeries(context.$i, context.seriesId)) return context.standardReader();
	const record = await readMappedPost(context);
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
