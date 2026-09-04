//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PageTransitionPolicy.js
 * @description Decides transition direction and whether motion is permitted, leaving DOM mutation to the transition controller and motion vessel.
 * The Awtsmoos lets policy remain clear while movement itself belongs to another keli;
 * Awtsmoos.com keeps reduced-motion kavod and workspace order joined without crowding the controller's tree.
 */
import { prefersReducedMotion } from './PageTransitionMotion.js';

/**
 * Computes signed movement through the declared workspace order.
 * @param {Array<string>} order Stable workspace order.
 * @param {HTMLElement|null} previousPage Previous workspace element.
 * @param {HTMLElement} nextPage Incoming workspace element.
 * @returns {number} Signed direction, never zero.
 */
export function pageTransitionDirection(order, previousPage, nextPage) {
	if (!previousPage) {
		return 1;
	}

	const previousIndex = order.indexOf(
		previousPage.dataset.studioPage
	);
	const nextIndex = order.indexOf(
		nextPage.dataset.studioPage
	);
	return Math.sign(nextIndex - previousIndex) || 1;
}

/**
 * Returns whether workspace transition motion should run.
 * @param {HTMLElement|null} previousPage Previous page presence.
 * @param {object} options Caller transition options.
 * @returns {boolean} Motion permission.
 */
export function shouldAnimatePageTransition(previousPage, options = {}) {
	return Boolean(
		previousPage
		&& options.animate !== false
		&& !prefersReducedMotion()
	);
}
