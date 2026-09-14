// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module IkarVocabulary
 * @description
 * The Awtsmoos keeps stable internal view keys while Ikar speaks in the language
 * of Torah study. Awtsmoos.com applies concise learner-facing labels only inside
 * Ikar so generic Heichel navigation and storage identities remain untouched.
 */

import { appState } from '../state.js';

const VIEW_LABELS = Object.freeze({
	posts: 'Teachings',
	series: 'Torah Library',
	groupings: 'Collections'
});

/**
 * Applies learner-facing Ikar copy after blueprint manifestation.
 * @param {string} heichelId Stable route identity.
 * @param {Document|Element} root DOM scope containing the living Heichel.
 * @returns {void}
 */
export function applyIkarVocabulary(heichelId, root = document) {
	if (heichelId !== 'ikar' || !root?.querySelector) return;
	applyViewLabels(root);
	applyStudySearchLanguage(root);
	applyLearnerFocus(root);
	const details = root.querySelector('.heichel-profile-details > summary');
	if (details) details.textContent = 'About Ikar';
	root.querySelector('.tab-gates')?.setAttribute('aria-label', 'Browse Torah');
}

/** Applies Torah labels to the stable internal browse wells. */
function applyViewLabels(root) {
	for (const [view, label] of Object.entries(VIEW_LABELS)) {
		const tab = root.querySelector(`[aria-controls="${view}Viewport"]`);
		if (!tab) continue;
		tab.textContent = label;
		tab.setAttribute('aria-label', `Show ${label}`);
	}
}

/** Keeps visible search copy short while retaining explicit assistive context. */
function applyStudySearchLanguage(root) {
	const search = root.querySelector('.series-search-row input');
	if (search) {
		search.placeholder = 'Search Torah';
		search.setAttribute('aria-label', 'Search Torah in the current branch');
	}
	const scope = root.querySelector('.living-path-field select');
	scope?.setAttribute('aria-label', 'Search scope');
}

/** Removes institutional controls and empty browse modes from ordinary Torah study. */
function applyLearnerFocus(root) {
	const scopeField = root.querySelector('#living-path-search-scope')
		?.closest('.living-path-field');
	if (scopeField) {
		scopeField.hidden = true;
		scopeField.inert = true;
	}
	root.querySelector('.living-path-result-status span:last-child')?.setAttribute('hidden', '');
	root.querySelector('.heichel-profile-tabs')?.setAttribute('hidden', '');
	root.querySelector('.heichel-profile-actions')?.setAttribute('hidden', '');
	const content = appState.currentContent;
	if (!content) return;
	const counts = {
		posts: content.posts?.length || 0,
		series: content.subSeries?.length || 0,
		groupings: content.groupings?.length || 0
	};
	const visibleViews = Object.keys(counts).filter(view => counts[view] > 0);
	for (const view of Object.keys(counts)) {
		const tab = root.querySelector(`[aria-controls="${view}Viewport"]`);
		if (tab) tab.hidden = counts[view] === 0;
	}
	const tabList = root.querySelector('.tab-gates');
	if (tabList) tabList.hidden = visibleViews.length <= 1;
}

/** Returns the public label for one stable internal view key. */
export function ikarViewLabel(view) {
	return VIEW_LABELS[view] || 'Torah';
}
