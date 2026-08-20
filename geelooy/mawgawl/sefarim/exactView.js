// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewSearchView
 * @description
 * The Awtsmoos reveals each exact occurrence as a compact matched preview with one true reader coordinate;
 * Awtsmoos.com lets the seeker see the word in context, enter here, open anew, or reveal insights at the same place.
 */

import { postDestination } from './exactDestination.js';
import { exactPreviewParts } from './exactPreview.js';
import { appendSourceActions } from './resultSourceActions.js';

const CORPUS_LABELS = {
	tanach: 'Tanach',
	mishnah: 'Mishnah',
	talmudBavli: 'Talmud Bavli'
};

function coordinate(ref = {}, corpus = '') {
	if (corpus === 'tanach') {
		return `${ref.bookTitleHebrew || ref.seriesId || 'Tanach'} ${ref.chapter || '?'}:${ref.verse || '?'}`;
	}
	if (corpus === 'mishnah') {
		return `${ref.tractateTitle || ref.seriesId || 'Mishnah'} ${ref.chapter || '?'}:${ref.mishnah || '?'}`;
	}
	return `${ref.tractateTitle || ref.seriesId || 'Talmud'} ${ref.daf || ''}${ref.amud ? ` ${ref.amud}` : ''}`.trim();
}

function previewText(ref = {}) {
	return ref.textOrig || ref.text || (ref.lines || []).join(' ');
}

function appendPreview(target, hit, ref) {
	const parts = exactPreviewParts(
		previewText(ref),
		hit.originalWord || hit.normalizedWord
	);
	if (parts.leading) target.append('… ');
	target.append(parts.before);
	if (parts.match) {
		const mark = document.createElement('mark');
		mark.textContent = parts.match;
		target.append(mark);
	}
	target.append(parts.after);
	if (parts.trailing) target.append(' …');
}

function exactCard(hit) {
	const ref = hit.ref || {};
	const card = document.createElement('article');
	card.className = 'result tanach-result exact-hebrew-result';
	const heading = document.createElement('h3');
	heading.textContent = coordinate(ref, hit.corpus);
	const text = document.createElement('p');
	text.dir = 'rtl';
	text.lang = 'he';
	appendPreview(text, hit, ref);
	const provenance = document.createElement('small');
	provenance.className = 'tanach-provenance';
	provenance.textContent = `${CORPUS_LABELS[hit.corpus] || hit.corpus} · exact “${hit.originalWord || hit.normalizedWord || ''}”`;
	const actions = document.createElement('div');
	actions.className = 'resultActions';
	actions.hidden = true;
	appendSourceActions(actions, {
		destination: postDestination(ref),
		idx: ref.sectionIndex,
		sub: ref.subSectionIndex,
		label: heading.textContent
	});
	card.append(heading, text, provenance, actions);
	return card;
}

export function renderExactHebrew({ search, results, status }) {
	const hits = Array.isArray(search.hits) ? search.hits : [];
	results.replaceChildren(...hits.map(exactCard));
	if (!hits.length) {
		const empty = document.createElement('article');
		empty.className = 'library-empty';
		empty.textContent = 'No indexed occurrence matched this exact Hebrew word.';
		results.append(empty);
	}
	const total = Number(search.totalHits || 0);
	status.textContent = `${total.toLocaleString()} exact occurrence${total === 1 ? '' : 's'} found. Showing ${hits.length}.`;
}
