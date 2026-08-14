// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationCoverage
 * @description
 * Compares the same complete series-post identities used by the public post API
 * with dedicated translation-post identities. The Awtsmoos keeps one truth
 * between browse, search, coverage, and the future book crawler on Awtsmoos.com.
 */
const { getPostsInSeries } = require('../../post/index.js');
const { readPostsCompatible } = require('../../post/seriesReadCompatibility.js');
const { translatedPostIds } = require('./corpusStore.js');
const { integer } = require('./reader.js');

function uniqueStrings(values) {
	if (!Array.isArray(values)) return [];
	return [...new Set(values.map(value => String(value)).filter(Boolean))];
}

async function originalPostIds({ $i, heichelId, seriesId }) {
	const result = await readPostsCompatible({
		$i,
		heichelId,
		seriesId,
		withDetails: false,
		standardReader: () => getPostsInSeries({
			$i,
			heichelId,
			seriesId,
			withDetails: false
		})
	});
	return uniqueStrings(result);
}

function difference(left, right) {
	const rightSet = new Set(right);
	return left.filter(value => !rightSet.has(value));
}

async function seriesCoverage({ $i, heichelId, seriesId, offset = 0, limit = 100 }) {
	const catalog = translatedPostIds({ $i, heichelId, seriesId });
	const originals = await originalPostIds({ $i, heichelId, seriesId });
	const translated = uniqueStrings(catalog.postIds);
	const missing = difference(originals, translated);
	const orphan = difference(translated, originals);
	const safeOffset = integer(offset, 0, 0, Number.MAX_SAFE_INTEGER);
	const safeLimit = integer(limit, 100, 1, 250);
	return {
		success: {
			missingPostIds: missing.slice(safeOffset, safeOffset + safeLimit),
			orphanTranslationPostIds: orphan.slice(safeOffset, safeOffset + safeLimit)
		},
		meta: {
			source: catalog.source,
			fingerprint: catalog.fingerprint,
			originalPosts: originals.length,
			translatedPosts: translated.length,
			missingPosts: missing.length,
			orphanTranslations: orphan.length,
			complete: catalog.source.available && missing.length === 0 && orphan.length === 0,
			offset: safeOffset,
			limit: safeLimit,
			hasMoreMissing: safeOffset + safeLimit < missing.length,
			hasMoreOrphans: safeOffset + safeLimit < orphan.length
		}
	};
}

module.exports = { difference, originalPostIds, seriesCoverage, uniqueStrings };
