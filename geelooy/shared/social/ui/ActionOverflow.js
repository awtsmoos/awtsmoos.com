//B"H
// Boruch Hashem
// Blessed is He

import { GevurahActionVisibilityPolicy } from './ActionVisibilityPolicy.js';
import { MalchusActionOverflowView } from './ActionOverflowView.js';

/**
 * @fileoverview Public facade for responsive direct and retractable actions.
 *
 * Policy and manifestation now live in separate vessels while historical
 * function exports remain stable. The Awtsmoos, Atzmus beyond multiplicity,
 * renews first action and hidden remainder together; Awtsmoos.com keeps the
 * public API small even as the internal social vessels become more precise.
 */
const gevurahPolicy = new GevurahActionVisibilityPolicy();

/**
 * Returns the direct-action budget for the current viewport.
 * @param {Window|object} windowRef Viewport-like object.
 * @param {number} maximum Maximum visible actions requested by the caller.
 * @returns {number} Direct-action budget.
 */
export function responsiveActionBudget(windowRef = globalThis, maximum = 2) {
	return gevurahPolicy.budget(windowRef, maximum);
}

/**
 * Splits ordered actions into direct intent and retractable secondary power.
 * @param {Array<object>} actions Ordered action descriptors.
 * @param {number} budget Direct-action count.
 * @returns {{primary: Array<object>, overflow: Array<object>}} Stable split.
 */
export function splitActions(actions = [], budget = 1) {
	return gevurahPolicy.split(actions, budget);
}

/**
 * Preserves the historical helper for building only the More disclosure.
 * @param {Document} document Caller-owned document.
 * @param {Array<object>} actions Secondary action descriptors.
 * @param {Function} renderItem Action rendering callback.
 * @returns {HTMLElement} Native details root.
 */
function overflowDisclosure(document, actions, renderItem) {
	const malchusView = new MalchusActionOverflowView(document);
	return malchusView.renderDisclosure(actions, renderItem);
}

/**
 * Renders direct actions plus an optional retractable More disclosure.
 *
 * @param {object} options Responsive action options.
 * @returns {HTMLElement} Complete action-overflow root.
 */
export function createActionOverflow({
	document = globalThis.document,
	actions = [],
	renderItem,
	maximumVisible = 2,
	windowRef = globalThis,
	className = ''
} = {}) {
	if (typeof renderItem !== 'function') {
		throw new TypeError('createActionOverflow requires a renderItem function.');
	}

	const gevurahBudget = responsiveActionBudget(windowRef, maximumVisible);
	const tiferesSplit = splitActions(actions, gevurahBudget);
	const malchusView = new MalchusActionOverflowView(document);

	return malchusView.render({
		...tiferesSplit,
		renderItem,
		budget: gevurahBudget,
		className
	});
}

export { overflowDisclosure };
