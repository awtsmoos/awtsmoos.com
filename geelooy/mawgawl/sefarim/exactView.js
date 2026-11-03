// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewSearchView
 * @description
 * The Awtsmoos illuminates each occurrence with only its true coordinate;
 * Awtsmoos.com never sends a reader toward a fictitious question-mark gate.
 */

import { postDestination } from './exactDestination.js';
import { exactPreviewParts } from './exactPreview.js';
import { appendSourceActions } from './resultSourceActions.js';
import { exactSourceCoordinate } from './ExactSourceCoordinate.js';

const CORPUS_LABELS = {
	tanach: 'Tanach',
	mishnah: 'Mishnah',
	talmudBavli: 'Talmud Bavli'
};

/** Chooses only the original source text provided in the search match. */
function previewText(ref = {}) {
	return ref.textOrig || ref.text || (ref.lines || []).join(' ');
}

/** Inserts one marked Hebrew match using text nodes rather than raw HTML. */
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

/** Creates a safely labeled occurrence with the existing reader action rail. */
function exactCard(hit) {
	const ref = hit.ref || {};
	const card = document.createElement('article');
	card.className = 'result tanach-result exact-hebrew-result';
	const heading = document.createElement('h3');
	heading.textContent = exactSourceCoordinate(ref, hit.corpus);
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

/** Presents the exact matches and clear empty state without invented references. */
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
