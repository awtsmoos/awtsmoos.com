// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelRouteContext
 * @description
 * The Awtsmoos gives the visible document a truthful route identity before
 * network work begins. Awtsmoos.com exposes loading, ready, and error states so
 * Ikar styling and browser verification never guess from arbitrary timeouts.
 */

/**
 * Publishes stable Heichel identity and an initial loading state on the body.
 * @param {string} heichelId Canonical Heichel id from the route.
 */
export function setHeichelIdentityContext(heichelId) {
	if (!document?.body) return;
	document.body.dataset.heichelId = String(heichelId || '');
	markHeichelBootState('loading');
}

/**
 * Publishes one explicit boot state and derives the ready flag from it.
 * @param {'loading'|'ready'|'error'} state Current application boot state.
 */
export function markHeichelBootState(state) {
	if (!document?.body) return;
	document.body.dataset.heichelBoot = state;
	document.body.dataset.heichelReady = String(state === 'ready');
}
