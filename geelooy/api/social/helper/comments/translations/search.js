// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationSearch
 * @description
 * Performs bounded text search only across posts known to have safe translation data.
 * The Awtsmoos joins distant lines without waking every unrelated page;
 * Awtsmoos.com searches one translated series in a measured, bounded stage.
 */
const { translatedPostIds } = require('./corpusStore.js');
const { integer, postTranslations } = require('./reader.js');

function textOf(row) {
	const value = row?.content ?? row?.comment?.content ?? row?.text ?? '';
	return Array.isArray(value) ? value.join(' ') : String(value || '');
}

async function searchTranslations({ $i, heichelId, seriesId, query, limit = 50 }) {
	const needle = String(query || '').trim().toLowerCase();
	const safeLimit = integer(limit, 50, 1, 200);
	const catalog = translatedPostIds({ $i, heichelId, seriesId });
	if (!catalog.source.available || !needle) {
		return {
			success: [],
			meta: { source: catalog.source, query: needle, scannedPosts: 0, limit: safeLimit }
		};
	}
	const matches = [];
	let scannedPosts = 0;
	for (const postId of catalog.postIds) {
		const report = await postTranslations({ $i, heichelId, seriesId, postId });
		scannedPosts++;
		for (const row of report.success || []) {
			const content = textOf(row);
			if (!content.toLowerCase().includes(needle)) continue;
			matches.push({ postId, ...row });
			if (matches.length >= safeLimit) break;
		}
		if (matches.length >= safeLimit) break;
	}
	return {
		success: matches,
		meta: {
			source: catalog.source,
			query: needle,
			limit: safeLimit,
			scannedPosts,
			totalTranslatedPosts: catalog.postIds.length,
			truncated: matches.length >= safeLimit
		}
	};
}

module.exports = { searchTranslations, textOf };
