// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mapping.js
 * @description
 * The Awtsmoos pairs the legacy and restored generations month by month under
 * the project's timestamp-order covenant, refusing every unequal procession.
 */

const { sortPostIds } = require("./ids.js");

function buildMappings(ledger, archivePosts) {
	const rows = [];
	for (const monthEntry of ledger.values()) {
		const archiveIds = sortPostIds(
			[...archivePosts.values()]
				.filter(post => post.seriesId === monthEntry.friendlySeriesId)
				.map(post => post.postId)
		);
		const legacyIds = monthEntry.legacyPostIds;
		if (archiveIds.length !== legacyIds.length) {
			throw new Error(
				`${monthEntry.month}: archive ${archiveIds.length}, legacy ${legacyIds.length}`
			);
		}
		for (let index = 0; index < archiveIds.length; index += 1) {
			rows.push({
				month: monthEntry.month,
				rank: index,
				newPostId: archiveIds[index],
				oldPostId: legacyIds[index],
				friendlySeriesId: monthEntry.friendlySeriesId,
				historicalSeriesId: monthEntry.historicalSeriesId,
				oldSeriesId: monthEntry.friendlySeriesId
			});
		}
	}
	if (rows.length !== 218) {
		throw new Error(`Mapping expected 218 rows, found ${rows.length}`);
	}
	return rows;
}

function buildCommentMap(rows) {
	const entries = {};
	for (const row of rows) {
		for (const seriesId of [row.friendlySeriesId, row.historicalSeriesId]) {
			entries[`${seriesId}\u0000${row.newPostId}`] = {
				seriesId,
				postId: row.newPostId,
				newPostId: row.newPostId,
				newSeriesId: seriesId,
				oldPostId: row.oldPostId,
				oldSeriesId: row.oldSeriesId,
				rank: row.rank,
				label: row.month
			};
		}
	}
	return {
		version: 1,
		generatedAt: new Date().toISOString(),
		count: Object.keys(entries).length,
		entries
	};
}

module.exports = {
	buildCommentMap,
	buildMappings
};
