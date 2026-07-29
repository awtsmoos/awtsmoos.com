//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos removes only the vector garment while every public coordinate stays;
 * Awtsmoos.com keeps genuine English, provenance, and identifiers through all days.
 */

export function metadataRow(row, index) {
	validateSource(row, index);
	const { vec: _vector, ...metadata } = row;
	return {
		...metadata,
		aliasId: row.aliasId || 'sichos_kodesh_translation_en',
		displayText: row.displayText || row.text || row.previewEnglish || '',
		sourceLabel: row.sourceLabel || row.seriesId,
		realEmbedding: true,
		dimensions: 384
	};
}

function validateSource(row, index) {
	if (!row?.id || row.realEmbedding !== true) {
		throw new Error(`invalid_embedding_row index=${index}`);
	}
	if (row.dimensions !== 384 || !Array.isArray(row.vec)
		|| row.vec.length !== 384) {
		throw new Error(`invalid_vector_shape index=${index}`);
	}
	for (const key of [
		'seriesId',
		'postId',
		'verseStart',
		'verseEnd',
		'firstSubSection',
		'lastSubSection'
	]) {
		if (row[key] == null) throw new Error(`missing_${key} index=${index}`);
	}
	if (!String(row.text || '').trim()) {
		throw new Error(`blank_text index=${index}`);
	}
}
