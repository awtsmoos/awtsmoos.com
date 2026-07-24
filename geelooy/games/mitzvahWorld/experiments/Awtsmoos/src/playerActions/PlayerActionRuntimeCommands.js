// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRuntimeCommands.js
 * @description Validates phase routing and starts finite registered action records.
 * The Awtsmoos is one before command and response; Awtsmoos.com separates message
 * interpretation from bone application so future actions need no controller edits.
 */

import { PLAYER_ACTION_PHASES } from './PlayerActionConstants.js';
import {
	boundedPlayerActionProgress,
	createPlayerActionState
} from './PlayerActionRuntimeState.js';

export function dispatchPlayerAction(runtime, message = {}) {
	if (!PLAYER_ACTION_PHASES.includes(message.phase)) {
		return runtime.reject('ACTION_PHASE_INVALID', message);
	}
	const definition = runtime.registry.forMessage(message.type);
	if (!definition) {
		return runtime.reject('ACTION_MESSAGE_UNKNOWN', message);
	}
	if (message.phase === 'start') {
		return startPlayerAction(runtime, definition, message);
	}
	if (!runtime.active || runtime.active.definition.id !== definition.id) {
		return runtime.reject('ACTION_NOT_ACTIVE', message);
	}
	if (message.phase === 'progress') {
		runtime.active.externalProgress = boundedPlayerActionProgress(message.progress);
		return runtime.snapshot();
	}
	if (message.phase === 'release') {
		return runtime.release(message);
	}
	return runtime.cancel(message.reason || 'cancelled');
}

export function startPlayerAction(runtime, definition, message) {
	const permission = runtime.actor.canPerform(definition);
	if (!permission.accepted) {
		return runtime.reject(permission.reason, message);
	}
	if (runtime.active && definition.priority < runtime.active.definition.priority) {
		return runtime.reject('ACTION_PRIORITY_BLOCKED', message);
	}
	if (runtime.active) {
		runtime.cancel('replaced');
	}
	runtime.sequence += 1;
	runtime.active = createPlayerActionState(definition, message, runtime.sequence);
	runtime.publish();
	return runtime.snapshot();
}
