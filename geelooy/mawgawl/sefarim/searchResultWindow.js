//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SearchResultWindow
 * @description
 * The Awtsmoos reveals stored sources in measured windows instead of flooding the learner's sight;
 * Awtsmoos.com lets Malchus receive each next group gently, with focus carried forward in light.
 */

import { rangeCard } from './rangeResults.js';

const RESULT_INCREMENT = 6;

/**
 * Renders a finite result window and progressively reveals the remaining hits.
 *
 * @param {HTMLElement} results Result surface that receives cards and continuation control.
 * @param {Object[]} hits Ordered merged search hits.
 * @param {number} visibleCount Number of hits to reveal in this pass.
 * @returns {void}
 */
export function renderResultWindow(results, hits, visibleCount) {
	const visibleHits = hits.slice(0, visibleCount);
	const firstCommentIndex = visibleHits.findIndex(hasComments);
	const cards = visibleHits.map((hit, index) => {
		return rangeCard(hit, index, index === firstCommentIndex);
	});

	results.replaceChildren(...cards);
	if (visibleCount >= hits.length) {
		return;
	}

	const button = createContinuationButton(hits.length - visibleCount);
	button.addEventListener('click', () => {
		const nextVisibleCount = visibleCount + RESULT_INCREMENT;
		renderResultWindow(results, hits, nextVisibleCount);
		focusFirstNewResult(results, visibleCount);
	});
	results.append(button);
}

/** Builds the continuation control without mixing pagination state into the parent view. */
function createContinuationButton(remainingCount) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'library-load-more';
	button.innerHTML = `<span>Show more sources</span><small>${remainingCount} remaining</small>`;
	return button;
}

/** Moves keyboard focus to the first result revealed by the latest continuation action. */
function focusFirstNewResult(results, previousVisibleCount) {
	const selector = `.result:nth-of-type(${previousVisibleCount + 1})`;
	results.querySelector(selector)?.focus({ preventScroll: true });
}

/** Returns whether one merged result contains at least one linked comment. */
function hasComments(hit) {
	return Array.isArray(hit?.comments) && hit.comments.length > 0;
}
