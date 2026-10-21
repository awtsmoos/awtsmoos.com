//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectorsRows
 * @description
 * Row identity, text extraction and normalization for pending comment vectors.
 */

const { present, MAX_TEXT_CHARS } = require('./pendingCommentVectorsCore.js');

/** Stable identity for one comment row: commentId wins, else coordinates. */
function recordKey(row = {}) {
	if (present(row.commentId)) return `id:${row.commentId}`;
	return [
		'coord',
		row.aliasId || '',
		row.seriesId || '',
		row.postId || '',
		row.verseSection ?? '',
		row.subSection ?? row.subsectionId ?? ''
	].join('‖');
}

/** Picks the English text worth embedding from a translation/summary row. */
function extractText(row = {}) {
	const candidates = [
		row.readable,
		row.text,
		row.previewEnglish,
		row.sampleContent,
		row.content,
		row.summary,
		row.headline
	];
	for (const candidate of candidates) {
		if (typeof candidate === 'string' && candidate.trim()) {
			return candidate.trim().slice(0, MAX_TEXT_CHARS);
		}
		if (candidate && typeof candidate === 'object') {
			const nested = extractText(candidate);
			if (nested) return nested;
		}
	}
	return '';
}

function normalizeRow(row = {}, aliasFallback = '') {
	const text = extractText(row);
	if (!text) return null;
	return {
		key: recordKey(row),
		commentId: present(row.commentId) ? String(row.commentId) : null,
		aliasId: String(row.aliasId || aliasFallback || ''),
		seriesId: String(row.seriesId || ''),
		postId: String(row.postId || ''),
		verseSection: row.verseSection ?? '',
		subSection: row.subSection ?? row.subsectionId ?? '',
		text
	};
}

module.exports = {
	recordKey,
	extractText,
	normalizeRow
};
