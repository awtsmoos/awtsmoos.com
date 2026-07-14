// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryRangeComments
 * @description
 * A normalized comment becomes one exact Heichel link and one safely rendered row.
 */

import {
	clean,
	safeFragment
} from './safeMarkup.js';

export function appendComments(list, comments, parent) {
	comments.forEach(entry => list.append(commentRow(entry, parent)));
	if (!comments.length) {
		list.textContent = 'No linked source comments were returned for this segment.';
	}
}

function commentRow(entry, parent) {
	const row = entry.row || entry.provenance || {};
	const link = document.createElement('a');
	link.className = 'rangeComment';
	link.href = exactUrl(row, parent) || '#';
	const coordinate = document.createElement('span');
	coordinate.className = 'commentCoord';
	coordinate.textContent = `§ ${row.subsectionId || row.verseSection || ''}`;
	const text = document.createElement('span');
	text.className = 'commentText';
	text.append(safeFragment(row.content || row.text || 'Comment'));
	const arrow = document.createElement('span');
	arrow.className = 'commentArrow';
	arrow.textContent = '↗';
	link.append(coordinate, text, arrow);
	return link;
}

function exactUrl(row, parent) {
	const heichel = clean(row.heichelId || parent.heichelId || 'ikar');
	const series = clean(row.seriesId || parent.seriesId || 'root');
	const post = clean(row.postId || parent.postId || '');
	if (!post || !row.id) return '';
	const parameters = new URLSearchParams({
		commentId: row.id
	});
	if (row.verseSection !== '' && row.verseSection != null) {
		parameters.set('verseSection', row.verseSection);
	}
	return `/heichelos/${encodeURIComponent(heichel)}/series/${encodeURIComponent(series)}/post/${encodeURIComponent(post)}?${parameters}`;
}
