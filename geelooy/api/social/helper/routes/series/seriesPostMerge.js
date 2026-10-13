//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesPostMerge
 * @description
 * B"H 2026-10-12 (api-hardening): series browse pages listed ZERO posts for
 * live corpora because series details read posts only from the legacy
 * per-series posts index (/social/heichelos/<h>/series/<s>/posts), while the
 * import lanes write the packed allPosts shard as the system of record.
 * This vessel merges both: legacy entries keep their shape, packed entries
 * arrive compact (never full bodies — browse cards stay bounded), and the
 * packed record wins on postId conflict because it is the import's truth.
 */

const { allPostsGrouped } = require('../../packed/allPostsIndex.js');

/**
 * Normalizes one legacy series-posts index entry to the merged shape.
 * Legacy entries are { author, postId, title } keyed by postId.
 */
function legacyEntry(postId, entry) {
	return {
		author: entry?.author || entry?.aliasId || '',
		postId: String(postId),
		title: entry?.title || '',
		_source: 'legacy'
	};
}

/** Normalizes one packed compact post to the merged shape. */
function packedEntry(compact) {
	return {
		author: compact?.aliasId || '',
		postId: String(compact?.postId || ''),
		title: compact?.title || '',
		aliasId: compact?.aliasId || '',
		excerpt: compact?.excerpt || '',
		updatedAt: compact?.updatedAt || 0,
		_source: 'packed'
	};
}

/** Merges one legacy posts object with one packed compact list. */
function mergePostObjects(legacy, packedList) {
	const merged = {};
	if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
		for (const [postId, entry] of Object.entries(legacy)) {
			if (!postId || !entry) continue;
			merged[postId] = legacyEntry(postId, entry);
		}
	} else if (Array.isArray(legacy)) {
		// Tolerate array-shaped legacy listings without dropping them.
		for (const entry of legacy) {
			const postId = entry?.postId || entry?.id;
			if (!postId) continue;
			merged[String(postId)] = legacyEntry(postId, entry);
		}
	}
	for (const compact of packedList || []) {
		const postId = compact?.postId ? String(compact.postId) : '';
		if (!postId) continue;
		merged[postId] = packedEntry(compact);
	}
	return merged;
}

/**
 * Reads merged posts for one series: legacy index + packed allPosts shard.
 * @returns {Promise<object>} Posts keyed by postId (legacy shape, compact).
 */
async function readMergedSeriesPosts({ $i, heichelId, seriesId, legacy }) {
	const groups = allPostsGrouped({ $i, heichelId, seriesIds: [String(seriesId)] });
	return mergePostObjects(legacy, groups.get(String(seriesId)) || []);
}

module.exports = {
	legacyEntry,
	mergePostObjects,
	packedEntry,
	readMergedSeriesPosts
};
