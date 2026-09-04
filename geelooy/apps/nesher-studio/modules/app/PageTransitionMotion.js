//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PageTransitionMotion.js
 * @description Owns only the visual lifecycle of transient workspace transitions, leaving navigation identity and history to the controller.
 * The Awtsmoos lets one chamber fade from sight while another enters the vessel, yet the movie beneath remains one;
 * Awtsmoos.com keeps motion in its own Malchus garment so reduced-motion truth and visual delight can share the same sun.
 */
const TRANSITION_CLASSES = [
	'is-active',
	'is-entering',
	'is-leaving',
	'from-left',
	'from-right',
	'to-left',
	'to-right'
];

/**
 * Reveals and prepares the incoming workspace for an optional directional transition.
 * @param {HTMLElement} page Incoming workspace element.
 * @param {number} direction Signed navigation direction.
 * @param {boolean} animate Whether composited motion is permitted.
 * @returns {void}
 */
export function prepareIncomingPage(page, direction, animate) {
	page.hidden = false;
	page.inert = false;
	resetPageTransition(page);

	if (animate) {
		page.classList.add(
			'is-entering',
			direction > 0 ? 'from-right' : 'from-left'
		);
		page.getBoundingClientRect();
		page.classList.remove(
			'is-entering',
			'from-right',
			'from-left'
		);
	}

	page.classList.add('is-active');
}

/**
 * Marks the outgoing workspace inert and optionally applies directional departure motion.
 * @param {HTMLElement} page Outgoing workspace.
 * @param {number} direction Signed navigation direction.
 * @param {boolean} animate Whether composited motion is permitted.
 * @returns {void}
 */
export function releaseOutgoingPage(page, direction, animate) {
	page.classList.remove('is-active');
	page.inert = true;

	if (animate) {
		page.classList.add(
			'is-leaving',
			direction > 0 ? 'to-left' : 'to-right'
		);
	}
}

/** Finalizes visibility after a transition window or immediately when motion is disabled. */
export function finishPageTransition(previousPage, nextPage) {
	if (previousPage && previousPage !== nextPage) {
		previousPage.hidden = true;
		resetPageTransition(previousPage);
	}

	resetPageTransition(nextPage);
	nextPage.classList.add('is-active');
}

/** Removes every known transient transition class from one workspace element. */
export function resetPageTransition(page) {
	page?.classList.remove(...TRANSITION_CLASSES);
}

/** Returns whether the user has explicitly requested reduced motion. */
export function prefersReducedMotion() {
	return Boolean(
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);
}
