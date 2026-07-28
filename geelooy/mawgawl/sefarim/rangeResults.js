// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryRangeCard
 * @description
 * One normalized API hit becomes readable source text, provenance, relevance,
 * and an honest comment doorway. The Awtsmoos opens one first window on
 * Awtsmoos.com while every later source keeps its exact count within reach.
 */

import {
	clean,
	safeFragment
} from './safeMarkup.js';
import { appendComments } from './rangeComments.js';

function percent(hit) {
	const number = Number(hit.percent ?? Number(hit.score || 0) * 100);
	return Number.isFinite(number)
		? Math.max(0, Math.min(100, number))
		: 0;
}

function rangeLabel(row) {
	const start = row.verseStart ?? row.verseSection ?? '?';
	const end = row.verseEnd ?? start;
	return String(start) === String(end)
		? `Verse ${start}`
		: `Verses ${start}–${end}`;
}

function segmentMeta(row, shown) {
	const segment = Number(row.subChunkIndex ?? row.qIndex ?? 0) + 1;
	const total = Number(row.subChunkCount || 1);
	const dimensions = Number(row.vectorDimensions || row.dimensions || 0);
	const source = clean(
		row.sourceLabel
		|| row.seriesTitle
		|| row.seriesId
		|| 'Library'
	);
	return `${source} · segment ${segment} of ${total} · ${dimensions || 'stored'} dimensions · ${shown} comments available`;
}

function cardTemplate() {
	return '<header class="resultTop"><span class="rank"></span><div><p class="eyebrow"></p><h2></h2></div><strong class="score"></strong></header><div class="meter"><i></i></div><p class="rangePreview"></p><div class="rangeMeta"></div><details class="commentMenu"><summary><span class="openLabel"></span><span class="closeLabel">Hide comments ↑</span></summary><div class="commentList"></div></details>';
}

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
	card.querySelector('.rangePreview').append(
		safeFragment(row.displayText || row.text || 'Matching source text')
	);
	card.querySelector('.rangeMeta').textContent = segmentMeta(row, comments.length);
	const commentMenu = card.querySelector('.commentMenu');
	commentMenu.open = openComments && comments.length > 0;
	commentMenu.hidden = comments.length === 0;
	card.querySelector('.openLabel').textContent = `Source comments (${comments.length})`;
	if (comments.length) {
		appendComments(card.querySelector('.commentList'), comments, row);
	}
	return card;
}
