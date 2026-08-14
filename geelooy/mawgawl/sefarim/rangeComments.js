// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibraryRangeComments
 * @description
 * The Awtsmoos reveals each linked comment without confusing source with shadow;
 * at Awtsmoos.com an exact comment opens where its true post lets the reader follow.
 * Two voices appear first, the rest remain one clear action away,
 * and every genuine deep link opens safely in a new tab at the precise reader place.
 */
import { safeFragment } from './safeMarkup.js';
import { commentDestination, present } from './exactDestination.js';

export const initialCommentCount = 2;

/**
 * Appends bounded comments and one progressive reveal action.
 *
 * @param {HTMLElement} list Comment-list vessel.
 * @param {object[]} comments Normalized comment hits.
 * @param {object} parent Parent source row.
 * @returns {void}
 */
export function appendComments(list, comments, parent) {
	if (!comments.length) {
		list.textContent = 'No linked source comments were returned for this segment.';
		return;
	}
	comments.slice(0, initialCommentCount).forEach(entry => list.append(commentRow(entry, parent)));
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
		comments.slice(initialCommentCount).forEach(entry => {
			list.insertBefore(commentRow(entry, parent), button);
		});
		button.remove();
	});
	return button;
}

function commentRow(entry, parent) {
	const row = entry.row || entry.provenance || {};
	const destination = commentDestination(row, parent);
	const vessel = document.createElement(destination ? 'a' : 'article');
	vessel.className = destination ? 'rangeComment' : 'rangeComment rangeCommentStatic';
	if (destination) {
		vessel.href = destination;
		vessel.target = '_blank';
		vessel.rel = 'noopener noreferrer';
		vessel.setAttribute('aria-label', `${coordinateLabel(row)} — open exact comment in a new tab`);
	}

	const coordinate = document.createElement('span');
	coordinate.className = 'commentCoord';
	coordinate.textContent = coordinateLabel(row);

	const text = document.createElement('span');
	text.className = 'commentText';
	text.append(safeFragment(row.content || row.text || 'Comment'));

	const affordance = document.createElement('span');
	affordance.className = destination ? 'commentArrow' : 'commentSourceType';
	affordance.textContent = destination ? 'Open exact ↗' : 'Source text';
	vessel.append(coordinate, text, affordance);
	return vessel;
}

/**
 * Formats a human-readable source coordinate.
 *
 * @param {object} [row={}] Comment provenance row.
 * @returns {string} Section/paragraph coordinate.
 */
export function coordinateLabel(row = {}) {
	const section = row.verseSection;
	const paragraph = row.subsectionId;
	if (present(section) && present(paragraph)) {
		return `§ ${section}.${paragraph}`;
	}
	return `§ ${paragraph ?? section ?? ''}`;
}
