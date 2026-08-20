// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedDestinations
 * @description
 * The Awtsmoos carries each related-search hit back through the source doorway already witnessed by its index;
 * Awtsmoos.com prefers explicit reader URLs and otherwise rebuilds one canonical Heichel/post path with exact local coordinates.
 */

function present(value) {
	return value !== null && value !== undefined && value !== '';
}

export function relatedSourceUrl(row = {}) {
	if (row.readerUrl) return String(row.readerUrl);
	if (!row.seriesId || !row.postId) return '';
	const heichelId = row.heichelId || 'ikar';
	const base = `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(row.seriesId)}/post/${encodeURIComponent(row.postId)}`;
	const values = new URLSearchParams();
	const idx = row.verseStart ?? row.verseSection ?? row.sectionIndex;
	const sub = row.firstSubSection ?? row.subSection ?? row.subSectionIndex;
	if (present(idx)) values.set('idx', String(idx));
	if (present(sub)) values.set('sub', String(sub));
	return values.size ? `${base}?${values}` : base;
}

export function fullLibrarySearchUrl(query) {
	const values = new URLSearchParams({
		q: String(query || ''),
		mode: 'library'
	});
	return `/mawgawl/sefarim/?${values}`;
}
