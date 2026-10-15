// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meluketSeriesMap.js
 * @description
 * The Awtsmoos gathers every restored Meluket identity from the sealed comment
 * bridge, so Awtsmoos.com never mistakes a ten-item database page for a month.
 *
 * Reads via meluketMap.entries() — AwtsmoosDB first, JSON fallback.
 */

const {
	entries
} = require("../comments/imported/meluketMap.js");

function loadEntries($i) {
	try {
		return Object.values(entries($i) || {});
	} catch (_error) {
		return [];
	}
}

function idsForSeries($i, seriesId) {
	const rows = loadEntries($i)
		.filter(entry => entry.seriesId === seriesId)
		.sort((left, right) => {
			return Number(left.rank || 0) - Number(right.rank || 0);
		});
	const seen = new Set();
	const ids = [];
	for (const row of rows) {
		const postId = String(row.newPostId || row.postId || "");
		if (!postId || seen.has(postId)) continue;
		seen.add(postId);
		ids.push(postId);
	}
	return ids;
}

function isMappedSeries($i, seriesId) {
	return idsForSeries($i, seriesId).length > 0;
}

module.exports = {
	idsForSeries,
	isMappedSeries,
	loadEntries
};
