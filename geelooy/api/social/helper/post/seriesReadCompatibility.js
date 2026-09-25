//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesReadCompatibility
 * @description
 * The Awtsmoos reconciles old and routed post identities without guessing a single post;
 * on Awtsmoos.com a routed vessel may replace legacy keys only when it proves every old key
 * and adds further living records, so transfer-restored Torah can return in stable order.
 */

const { idsForSeries, isMappedSeries } = require('./meluketSeriesMap.js');
const { completeSeriesKeys } = require('./seriesKeyCompleteness.js');
const {
	postsPath,
	readRecordsByIds,
	readSeriesPost
} = require('./seriesRecordReader.js');

/** Reads one post from a mapped series through the shared record boundary. */
async function readMappedPost(context) {
	return readSeriesPost(context, context.postId);
}

/** Reads mapped identities or their bounded detail records. */
async function readMappedPosts(context) {
	const postIds = idsForSeries(context.$i, context.seriesId);
	if (!postIds.length) return null;
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
}

/** Reads the legacy collection keys once, preserving their canonical order. */
async function readLegacyIds(context) {
	const result = await context.$i.db
		.getObjectKeys(postsPath(context.heichelId, context.seriesId))
		.catch(() => []);
	return Array.isArray(result) ? result : [];
}

/** Reconciles transfer-era routed keys only when they strictly contain the legacy set. */
async function readUnmappedPosts(context) {
	const legacyIds = await readLegacyIds(context);
	const complete = await completeSeriesKeys({
		...context,
		legacyIds
	});
	const postIds = complete.ids;
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
}

/** Selects mapped or ordinary compatibility logic without invoking a bulk legacy reader. */
async function readPostsCompatible(context) {
	if (isMappedSeries(context.$i, context.seriesId)) {
		return readMappedPosts(context);
	}
	return readUnmappedPosts(context);
}

/** Reads one post canonically and falls back to the historical standard reader if needed. */
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
