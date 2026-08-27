// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationReader
 * @description
 * Reads imported translation rows without ever touching native comment storage.
 * Rich imported comments may include summaries; this reader returns translated Torah only.
 */
const { loadImported } = require('../imported/orchestrator.js');
const { describe } = require('./catalog.js');
const { translatedPostIds } = require('./corpusStore.js');

function integer(value, fallback, min, max) {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.max(min, Math.min(max, parsed));
}

function page(values, offset, limit) {
	return values.slice(offset, offset + limit);
}

function translationRows(rows = []) {
	return rows.filter(row => {
		const kind = row?.dayuh?.kind || row?.sourceContent?.dayuh?.kind || '';
		return kind !== 'sectionSummaryBrief' && kind !== 'summary';
	});
}

async function postTranslations({ $i, heichelId, seriesId, postId }) {
	const source = describe(seriesId);
	if (!source.available) {
		return { success: [], meta: { source, postId, translated: false }, warnings: [{ code: 'TRANSLATION_SOURCE_UNAVAILABLE', status: source.status }] };
	}
	const report = await loadImported({ $i, heichelId, seriesId, postId, verseSection: '', subsectionId: '' });
	const rows = translationRows(report.rows || []);
	return {
		success: rows,
		meta: { source, postId, translated: Boolean(rows.length), ...(report.meta || {}) },
		warnings: report.warnings || []
	};
}

function seriesTranslations({ $i, heichelId, seriesId, offset = 0, limit = 50 }) {
	const catalog = translatedPostIds({ $i, heichelId, seriesId });
	const safeOffset = integer(offset, 0, 0, Number.MAX_SAFE_INTEGER);
	const safeLimit = integer(limit, 50, 1, 250);
	const postIds = page(catalog.postIds, safeOffset, safeLimit);
	return { success: postIds, meta: { source: catalog.source, fingerprint: catalog.fingerprint, totalTranslatedPosts: catalog.postIds.length, offset: safeOffset, limit: safeLimit, hasMore: safeOffset + postIds.length < catalog.postIds.length } };
}

module.exports = { integer, postTranslations, seriesTranslations, translationRows };
