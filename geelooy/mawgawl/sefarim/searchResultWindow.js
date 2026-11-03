//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchResultWindow
 * @description
 * The Awtsmoos reveals stored sources in measured windows, strongest testimony first in sight;
 * Awtsmoos.com lets Malchus receive each next group gently, with stable relevance and carried focus in light.
 */

import { rangeCard } from './rangeResults.js';

const RESULT_INCREMENT = 6;

/**
 * Converts one search hit into the same relevance percentage shown on its card.
 *
 * @param {Object} hit Search hit with optional `percent` or normalized `score`.
 * @returns {number} Finite relevance percentage clamped to 0..100.
 */
export function relevancePercent(hit = {}) {
	const raw = Number(hit.percent ?? Number(hit.score || 0) * 100);
	if (!Number.isFinite(raw)) {
		return 0;
	}
	return Math.max(0, Math.min(100, raw));
}

/**
 * Produces a stable descending relevance order without mutating backend testimony.
 *
 * @param {Object[]} hits Search hits in backend arrival order.
 * @returns {Object[]} New relevance-ordered array; equal scores preserve arrival order.
 */
export function orderHitsByRelevance(hits = []) {
	return hits
		.map((hit, index) => ({ hit, index, relevance: relevancePercent(hit) }))
		.sort((left, right) => {
			return right.relevance - left.relevance || left.index - right.index;
		})
		.map(entry => entry.hit);
}

/**
 * Renders a finite result window and progressively reveals the remaining hits.
 *
 * @param {HTMLElement} results Result surface that receives cards and continuation control.
 * @param {Object[]} hits Ordered or unordered merged search hits.
 * @param {number} visibleCount Number of hits to reveal in this pass.
 * @returns {void}
 */
export function renderResultWindow(results, hits, visibleCount) {
	const orderedHits = orderHitsByRelevance(hits);
	const visibleHits = orderedHits.slice(0, visibleCount);
	const firstCommentIndex = visibleHits.findIndex(hasComments);
	const cards = visibleHits.map((hit, index) => {
		return rangeCard(hit, index, index === firstCommentIndex);
	});

	results.replaceChildren(...cards);
	if (visibleCount >= orderedHits.length) {
		return;
	}

	const button = createContinuationButton(orderedHits.length - visibleCount);
	button.addEventListener('click', () => {
		const nextVisibleCount = visibleCount + RESULT_INCREMENT;
		renderResultWindow(results, orderedHits, nextVisibleCount);
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
