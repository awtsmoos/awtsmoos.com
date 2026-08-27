// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagMetadataCommentHits
 * @description
 * Meluket translation rows are already bounded comment segments. This module
 * exposes them directly without opening the large comment database.
 */

function translatedMetadataRow(row = {}) {
	return row.aliasId === 'meluket_translation_en'
		|| String(row.textPolicy || '').includes('meluket-english-comments');
}

function metadataComment(row = {}) {
	if (!translatedMetadataRow(row) || !String(row.text || '').trim()) return null;
	const id = row.id || row.firstCommentId || row.commentIds?.[0];
	if (!id) return null;
	const subsectionId = row.firstSubSection ?? '';
	const commentRow = {
		id,
		commentIds: Array.isArray(row.commentIds) ? row.commentIds : [],
		aliasId: row.aliasId || 'meluket_translation_en',
		author: row.aliasId || 'meluket_translation_en',
		heichelId: row.heichelId || 'ikar',
		seriesId: row.seriesId || '',
		postId: row.postId || '',
		verseSection: row.verseStart ?? '',
		subsectionId,
		subSection: subsectionId,
		title: row.title || '',
		content: row.text,
		text: row.text,
		translated: true,
		ragCommentSource: 'meluketTranslationMetadata'
	};
	return {
		id,
		found: true,
		source: 'meluketTranslationMetadata',
		row: commentRow,
		segmentMatch: true,
		overlap: 1,
		provenance: commentRow
	};
}

function attachMetadataComments(hits = [], enabled = true) {
	const satisfied = new Set();
	const hydrated = hits.map((hit, index) => {
		if (!enabled) return hit;
		const comment = metadataComment(hit.row);
		if (!comment) return hit;
		satisfied.add(index);
		return { ...hit, comments: [comment] };
	});
	return { hydrated, satisfied };
}

module.exports = {
	attachMetadataComments,
	metadataComment,
	translatedMetadataRow
};
