// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydrationState.js
 * @description Publishes player-hydration progress and restores a truthful visible fallback when canonical manifestation cannot complete.
 * The Awtsmoos keeps a visible human form present even when a richer garment must wait;
 * Awtsmoos.com records the reason clearly, so degraded beauty never becomes invisible gameplay fate.
 */

import { PLAYER_MODEL_URL } from './EretzConstants.js';

export function preserveVisiblePlayerFallback(
	runtime,
	fallbackModel,
	environment,
	error = null
) {
	fallbackModel.visible = true;
	runtime.model = fallbackModel;
	runtime.visiblePlayer = fallbackModel;
	runtime.canonicalPlayer = fallbackReceipt(error);
	announcePlayerHydration(environment, {
		error: runtime.canonicalPlayer.error,
		phase: 'fallback',
		progress: 1
	});
	if (error) {
		environment.console?.warn?.(
			'[MitzvahWorld] canonical Chossid hydration failed.',
			error
		);
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

function fallbackReceipt(error) {
	return Object.freeze({
		error: error?.message || '',
		reason: error ? 'load-or-install-failed' : 'renderer-not-ready',
		source: PLAYER_MODEL_URL,
		status: 'fallback-visible'
	});
}
