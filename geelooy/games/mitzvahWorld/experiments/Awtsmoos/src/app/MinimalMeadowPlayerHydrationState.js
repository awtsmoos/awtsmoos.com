// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydrationState.js
 * @description Records canonical hydration failure while preserving only the known local bootstrap traveler that already made movement visibly truthful.
 * The Awtsmoos does not demand that a distant garment erase the humble garment already carrying the traveler;
 * Awtsmoos.com keeps the proven local Chossid visible when authored GLB truth is unavailable, while unknown counterfeit predecessors are still refused.
 */

import { PLAYER_MODEL_URL } from './EretzConstants.js';

/** Keeps the known bootstrap traveler on failure, but rejects every unknown predecessor. */
export function rejectNoncanonicalPlayerFallback(
	runtime,
	predecessor,
	environment,
	error = null
) {
	const preserved = isTrustedBootstrapPlayer(predecessor);
	if (preserved) {
		predecessor.traverse?.(object => {
			object.visible = true;
		});
		runtime.model = predecessor;
		runtime.visiblePlayer = predecessor;
	} else {
		removePredecessor(predecessor);
		if (runtime.model === predecessor) runtime.model = null;
		if (runtime.visiblePlayer === predecessor) runtime.visiblePlayer = null;
	}
	runtime.playerVisualGuard = preserved ? 'bootstrap-visible-fallback' : null;
	runtime.canonicalPlayer = unavailableReceipt(error, preserved);
	announcePlayerHydration(environment, {
		error: runtime.canonicalPlayer.error,
		phase: preserved ? 'bootstrap-preserved' : 'canonical-unavailable',
		progress: 1
	});
	if (error) {
		environment.console?.warn?.('[MitzvahWorld] canonical Chossid unavailable.', error);
	}
	return preserved ? runtime.canonicalPlayer : null;
}

export function announcePlayerHydration(environment, detail) {
	if (!environment.CustomEvent || !environment.dispatchEvent) return;
	environment.dispatchEvent(new environment.CustomEvent(
		'awtsmoos:model-progress',
		{ detail }
	));
}

function isTrustedBootstrapPlayer(predecessor) {
	return predecessor?.userData?.bootstrapPlayerVisual === true
		&& predecessor?.userData?.fallbackVisible === true;
}

function removePredecessor(predecessor) {
	if (!predecessor) return;
	predecessor.traverse?.(object => {
		object.visible = false;
	});
	predecessor.parent?.remove?.(predecessor);
}

function unavailableReceipt(error, preserved) {
	return Object.freeze({
		error: error?.message || '',
		fallback: preserved ? 'bootstrap-visible-player' : '',
		reason: error ? 'load-or-install-failed' : 'renderer-not-ready',
		source: PLAYER_MODEL_URL,
		status: preserved ? 'bootstrap-preserved' : 'canonical-unavailable'
	});
}
