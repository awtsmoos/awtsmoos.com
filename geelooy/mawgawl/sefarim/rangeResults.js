// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibraryRangeCard
 * @description
 * The Awtsmoos lets every truthful search hit point back to its living source;
 * at Awtsmoos.com relevance is useful only when a reader can follow its course.
 * Each card keeps provenance, readable text, comments, and an explicit post gate,
 * so search becomes a doorway into the real Heichelos location instead of a dead state.
 */
import { clean, safeFragment } from './safeMarkup.js';
import { appendComments } from './rangeComments.js';
import { postDestination } from './exactDestination.js';

function percent(hit) {
	const number = Number(hit.percent ?? Number(hit.score || 0) * 100);
	return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}

function rangeLabel(row) {
	const start = row.verseStart ?? row.verseSection ?? '?';
	const end = row.verseEnd ?? start;
	return String(start) === String(end) ? `Verse ${start}` : `Verses ${start}–${end}`;
}

function segmentMeta(row, shown) {
	const segment = Number(row.subChunkIndex ?? row.qIndex ?? 0) + 1;
	const total = Number(row.subChunkCount || 1);
	const dimensions = Number(row.vectorDimensions || row.dimensions || 0);
	const source = clean(row.sourceLabel || row.seriesTitle || row.seriesId || 'Library');
	return `${source} · segment ${segment} of ${total} · ${dimensions || 'stored'} dimensions · ${shown} comments available`;
}

function cardTemplate() {
	return '<header class="resultTop"><span class="rank"></span><div><p class="eyebrow"></p><h2></h2></div><strong class="score"></strong></header><div class="meter"><i></i></div><p class="rangePreview"></p><div class="rangeMeta"></div><div class="resultActions" hidden></div><details class="commentMenu"><summary><span class="openLabel"></span><span class="closeLabel">Hide comments ↑</span></summary><div class="commentList"></div></details>';
}

function appendPostAction(card, row) {
	const destination = postDestination(row);
	const actions = card.querySelector('.resultActions');
	if (!destination || !actions) {
		return;
	}
	const link = document.createElement('a');
	link.className = 'resultOpenLink';
	link.href = destination;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = 'Open real post ↗';
	link.setAttribute('aria-label', `Open ${clean(row.title || row.postId || 'source post')} in a new tab`);
	actions.hidden = false;
	actions.append(link);
}

/**
 * Creates one search-result card whose source and comments remain directly reachable.
 *
 * @param {object} hit Normalized search hit.
 * @param {number} index Zero-based visible rank.
 * @param {boolean} openComments Whether comments begin expanded.
 * @returns {HTMLElement} Rendered result article.
 */
export function rangeCard(hit, index, openComments = false) {
	const row = hit.row || {};
	const comments = (Array.isArray(hit.comments) ? hit.comments : []).filter(entry => {
		return entry?.found || entry?.row || entry?.provenance;
	});
	const relevance = percent(hit);
	const card = document.createElement('article');
	card.className = 'result range-result';
	card.style.setProperty('--relevance', `${relevance}%`);
	card.innerHTML = cardTemplate();
	card.querySelector('.rank').textContent = index + 1;
	card.querySelector('.eyebrow').textContent = `${clean(row.sourceLabel || row.seriesId)} · ${rangeLabel(row)}`;
	card.querySelector('h2').textContent = clean(row.title || row.postId || 'Source segment');
	card.querySelector('.score').textContent = `${relevance.toFixed(1)}% relevant`;
	card.querySelector('.rangePreview').append(safeFragment(row.displayText || row.text || 'Matching source text'));
	card.querySelector('.rangeMeta').textContent = segmentMeta(row, comments.length);
	appendPostAction(card, row);

	const commentMenu = card.querySelector('.commentMenu');
	commentMenu.open = openComments && comments.length > 0;
	commentMenu.hidden = comments.length === 0;
	card.querySelector('.openLabel').textContent = `Source comments (${comments.length})`;
	if (comments.length) {
		appendComments(card.querySelector('.commentList'), comments, row);
	}
	return card;
}
