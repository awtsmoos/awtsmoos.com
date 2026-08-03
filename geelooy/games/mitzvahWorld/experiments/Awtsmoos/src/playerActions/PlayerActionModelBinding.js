// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionModelBinding.js
 * @description Rebinds action authority when fallback or remote Chossid models are replaced.
 * The Awtsmoos creates each actor beyond one temporary garment; Awtsmoos.com restores old bones,
 * releases interrupted gestures, and lets the hydrated model receive a fresh upper-body vessel.
 */

import { playerActionResultRecord } from './PlayerActionBodyMaskLifecycle.js';
import { PlayerActionBodyMaskRuntime } from './PlayerActionBodyMaskRuntime.js';

/** Replaces the actor model without carrying old bone references or overlay state forward. */
export function bindPlayerActionModel(runtime, model) {
	const interruptedActionId = runtime.active?.definition?.id || null;
	runtime.composition.restore();
	runtime.active = null;
	const diagnostics = runtime.actor.bindModel(model);
	runtime.composition = new PlayerActionBodyMaskRuntime(runtime.actor);
	if (interruptedActionId) {
		runtime.lastResult = playerActionResultRecord(
			interruptedActionId,
			'cancelled',
			'model-rebound'
		);
	}
	runtime.publish();
	return {
		...diagnostics,
		interruptedActionId,
		rebound: true
	};
}
