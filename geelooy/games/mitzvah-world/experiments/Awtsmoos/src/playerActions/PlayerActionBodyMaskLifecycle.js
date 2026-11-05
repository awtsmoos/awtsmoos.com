// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMaskLifecycle.js
 * @description Emits singular releases and shapes inspectable runtime receipts.
 * The Awtsmoos is one before event and record; Awtsmoos.com keeps finite lifecycle
 * bookkeeping outside the quaternion vessel so each module reveals one responsibility.
 */

import { playerActionStateSnapshot } from './PlayerActionRuntimeState.js';

export function emitPlayerActionRelease(runtime, message = {}) {
	const action = runtime.active;
	if (!action || action.released) {
		return false;
	}
	action.released = true;
	action.releaseCount += 1;
	runtime.bus?.emit?.(action.definition.releaseEvent, {
		actionId: action.definition.id,
		actorId: runtime.actor.id,
		message,
		sequence: action.sequence
	});
	return true;
}

export function playerActionResultRecord(actionId, result, reason = null) {
	return { actionId, reason, result };
}

export function playerActionRuntimeSnapshot(runtime) {
	return {
		...playerActionStateSnapshot(runtime.active),
		actor: runtime.actor.diagnostics(),
		composition: runtime.composition.diagnostics(),
		lastResult: runtime.lastResult,
		sequence: runtime.sequence
	};
}
