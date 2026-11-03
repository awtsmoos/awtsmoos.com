// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryRangeCard
 * @description
 * The Awtsmoos gives the seeker a source and never feigns a number;
 * Awtsmoos.com lets an unnamed verse rest, not send a reader into slumber.
 * Rich excerpts and source links remain intact beneath the honest heading.
 */

import { clean, safeFragment } from './safeMarkup.js';
import { appendComments } from './rangeComments.js';
import { postDestination } from './exactDestination.js';
import { appendSourceActions } from './resultSourceActions.js';
import { verseRangeLabel } from './VerseRangeLabel.js';

/** Gives nonnegative percentages without inventing relevance over 100%. */
function percent(hit) {
	const number = Number(hit.percent ?? Number(hit.score || 0) * 100);
	return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}

/** Describes segment position, source metadata and available comments. */
function segmentMeta(row, shown) {
	const segment = Number(row.subChunkIndex ?? row.qIndex ?? 0) + 1;
	const total = Number(row.subChunkCount || 1);
	const dimensions = Number(row.vectorDimensions || row.dimensions || 0);
	const source = clean(row.sourceLabel || row.seriesTitle || row.seriesId || 'Library');
	return `${source} · segment ${segment} of ${total} · ${dimensions || 'stored'} dimensions · ${shown} comments available`;
}

/** Keeps the existing accessible card structure and comment disclosure. */
function cardTemplate() {
	return '<header class="resultTop"><span class="rank"></span><div><p class="eyebrow"></p><h2></h2></div><strong class="score"></strong></header><div class="meter"><i></i></div><p class="rangePreview"></p><div class="rangeMeta"></div><div class="resultActions" hidden></div><details class="commentMenu"><summary><span class="openLabel"></span><span class="closeLabel">Hide comments ↑</span></summary><div class="commentList"></div></details>';
}

/** Adds existing canonical post and subsection links without fictional verse IDs. */
function appendPostActions(card, row) {
	const actions = card.querySelector('.resultActions');
	appendSourceActions(actions, {
		destination: postDestination(row),
		idx: row.verseStart ?? row.verseSection,
		sub: row.subSection ?? row.subsection,
		label: clean(row.title || row.postId || 'source post')
	});
}

/**
 * Builds a complete search card with an honest verse or section label.
 * @param {object} hit - Normalized search match.
 * @param {number} index - Zero-based visible rank.
 * @param {boolean} openComments - Whether comments are expanded initially.
 * @returns {HTMLElement} Accessible result article with source links.
 */
export function rangeCard(hit, index, openComments = false) {
	const row = hit.row || {};
	const comments = (Array.isArray(hit.comments) ? hit.comments : []).filter(entry => {
		return entry?.found || entry?.row || entry?.provenance;
	});
	const relevance = percent(hit);
	const card = document.createElement('article');
	card.className = 'result range-result mi-fade-up';
	card.style.setProperty('--relevance', `${relevance}%`);
	card.style.setProperty('--mi-i', String(Math.max(0, index || 0)));
	card.innerHTML = cardTemplate();
	card.querySelector('.rank').textContent = index + 1;
	card.querySelector('.eyebrow').textContent = `${clean(row.sourceLabel || row.seriesId)} · ${verseRangeLabel(row)}`;
	card.querySelector('h2').textContent = clean(row.title || row.postId || 'Source segment');
	card.querySelector('.score').textContent = `${relevance.toFixed(1)}% relevant`;
	card.querySelector('.rangePreview').append(safeFragment(row.displayText || row.text || 'Matching source text'));
	card.querySelector('.rangeMeta').textContent = segmentMeta(row, comments.length);
	appendPostActions(card, row);

	const commentMenu = card.querySelector('.commentMenu');
	commentMenu.open = openComments && comments.length > 0;
	commentMenu.hidden = comments.length === 0;
	card.querySelector('.openLabel').textContent = `Source comments (${comments.length})`;
	if (comments.length) appendComments(card.querySelector('.commentList'), comments, row);
	return card;
}
