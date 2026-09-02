// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydrationState.js
 * @description Fails canonical hydration closed: a noncanonical predecessor is removed rather than restored as a generated human.
 * The Awtsmoos may conceal a garment while truth is unavailable, yet never requires a counterfeit form;
 * Awtsmoos.com records the missing canonical player plainly so loading/error remains honest through every storm.
 */

import { PLAYER_MODEL_URL } from './EretzConstants.js';

export function rejectNoncanonicalPlayerFallback(runtime, predecessor, environment, error = null) {
	removePredecessor(predecessor);
	if (runtime.model === predecessor) runtime.model = null;
	if (runtime.visiblePlayer === predecessor) runtime.visiblePlayer = null;
	runtime.playerVisualGuard = null;
	runtime.canonicalPlayer = unavailableReceipt(error);
	announcePlayerHydration(environment, {
		error: runtime.canonicalPlayer.error,
		phase: 'canonical-unavailable',
		progress: 1
	});
	if (error) environment.console?.warn?.('[MitzvahWorld] canonical Chossid unavailable.', error);
	return null;
}

export function announcePlayerHydration(environment, detail) {
	if (!environment.CustomEvent || !environment.dispatchEvent) return;
	environment.dispatchEvent(new environment.CustomEvent(
		'awtsmoos:model-progress',
		{ detail }
	));
}

function removePredecessor(predecessor) {
	if (!predecessor) return;
	predecessor.traverse?.(object => {
		object.visible = false;
	});
	predecessor.parent?.remove?.(predecessor);
}

function unavailableReceipt(error) {
	return Object.freeze({
		error: error?.message || '',
		reason: error ? 'load-or-install-failed' : 'renderer-not-ready',
		source: PLAYER_MODEL_URL,
		status: 'canonical-unavailable'
	});
}
