//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowPlayerHydrationState.js
 * @description Enforces the canonical-GLB-only human covenant for every legacy hydration path.
 * If authored player hydration fails, the predecessor is removed and no generated or procedural human remains visible.
 */

import { PLAYER_MODEL_URL } from './EretzConstants.js';

/**
 * Removes every noncanonical predecessor and records an explicit unavailable receipt.
 * @returns {null} Human fallbacks are forbidden, so failure never returns a substitute player.
 */
export function rejectNoncanonicalPlayerFallback(
	runtime,
	predecessor,
	environment,
	error = null
) {
	removePredecessor(predecessor);
	if (runtime.model === predecessor) runtime.model = null;
	if (runtime.visiblePlayer === predecessor) runtime.visiblePlayer = null;
	runtime.playerVisualGuard = 'canonical-glb-required';
	runtime.canonicalPlayer = unavailableReceipt(error);
	announcePlayerHydration(environment, {
		error: runtime.canonicalPlayer.error,
		phase: 'canonical-unavailable',
		progress: 1
	});
	if (error) {
		environment.console?.warn?.('[MitzvahWorld] canonical Chossid unavailable.', error);
	}
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
		fallback: '',
		reason: error ? 'load-or-install-failed' : 'renderer-not-ready',
		source: PLAYER_MODEL_URL,
		status: 'canonical-unavailable'
	});
}
