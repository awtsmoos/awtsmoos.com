// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryRangeComments
 * @description
 * The Awtsmoos reveals two immediate paragraphs, then keeps every remaining
 * voice behind one honest reader action. Awtsmoos.com preserves full text and
 * exact destinations without forcing one source to occupy several screens.
 */

import {
	clean,
	safeFragment
} from './safeMarkup.js';

const SIDECAR_SOURCE = 'sichosKodeshDocumentSidecar';
export const initialCommentCount = 2;

export function appendComments(list, comments, parent) {
	if (!comments.length) {
		list.textContent = 'No linked source comments were returned for this segment.';
		return;
	}
	comments
		.slice(0, initialCommentCount)
		.forEach(entry => list.append(commentRow(entry, parent)));
	if (comments.length > initialCommentCount) {
		list.append(revealButton(list, comments, parent));
	}
}

function revealButton(list, comments, parent) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'commentRevealButton';
	button.textContent = `Show all ${comments.length} comments`;
	button.addEventListener('click', () => {
		comments
			.slice(initialCommentCount)
			.forEach(entry => list.insertBefore(commentRow(entry, parent), button));
		button.remove();
	});
	return button;
}

function commentRow(entry, parent) {
	const row = entry.row || entry.provenance || {};
	const destination = exactUrl(row, parent);
	const vessel = document.createElement(destination ? 'a' : 'article');
	vessel.className = destination
		? 'rangeComment'
		: 'rangeComment rangeCommentStatic';
	if (destination) {
		vessel.href = destination;
	}
	const coordinate = document.createElement('span');
	coordinate.className = 'commentCoord';
	coordinate.textContent = coordinateLabel(row);
	const text = document.createElement('span');
	text.className = 'commentText';
	text.append(safeFragment(row.content || row.text || 'Comment'));
	const affordance = document.createElement('span');
	affordance.className = destination
		? 'commentArrow'
		: 'commentSourceType';
	affordance.textContent = destination ? '↗' : 'Source text';
	vessel.append(coordinate, text, affordance);
	return vessel;
}

export function coordinateLabel(row = {}) {
	const section = row.verseSection;
	const paragraph = row.subsectionId;
	if (present(section) && present(paragraph)) {
		return `§ ${section}.${paragraph}`;
	}
	return `§ ${paragraph ?? section ?? ''}`;
}

export function exactUrl(row, parent) {
	if (row.ragCommentSource === SIDECAR_SOURCE) {
		return '';
	}
	const heichel = clean(row.heichelId || parent.heichelId || 'ikar');
	const series = clean(row.seriesId || parent.seriesId || 'root');
	const post = clean(row.postId || parent.postId || '');
	if (!post || !row.id) return '';
	const parameters = new URLSearchParams({ commentId: row.id });
	if (present(row.verseSection)) {
		parameters.set('verseSection', row.verseSection);
	}
	return `/heichelos/${encodeURIComponent(heichel)}/series/${encodeURIComponent(series)}/post/${encodeURIComponent(post)}?${parameters}`;
}

function present(value) {
	return value !== '' && value !== null && value !== undefined;
}
