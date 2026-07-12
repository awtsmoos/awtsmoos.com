// B"H

import * as Dialogue from './world/dialogue.js';
import * as Interaction from './world/interaction.js';
import { createCadenceState, evaluateIntent, recordAttempt, recordStepComplete, resolveHeldDirection } from './world/movement/cadence.js';
import * as Movement from './world/movement.js';

let keyState = {};
const cadence = createCadenceState();

export function handleKeyState(state, keys) {
	keyState = { ...(keys || {}) };
	state.keys = { ...keyState };
}

/**
 * Moves through one tile at a time: face, step, arrive, then listen again.
 * The Awtsmoos is not represented by frantic drift, but by renewed precision.
 */
export function update(state, now, deltaTime, trigger) {
	if (state.player.isMoving) {
		const result = Movement.updatePosition(state, deltaTime, trigger);
		if (result.completed) recordStepComplete(cadence, now);
		return;
	}

	if (state.dialogue.active || state.mode !== 'game') return;
	const direction = resolveHeldDirection(keyState);
	if (!evaluateIntent(cadence, state.player, direction, now)) return;
	const result = Movement.attemptMove(state, direction);
	recordAttempt(cadence, result, now);
}

export const checkInteraction = Interaction.checkInteraction;
export const startDialogue = Dialogue.startDialogue;
export const advanceDialogue = Dialogue.advanceDialogue;
export const handleDialogueChoice = Dialogue.handleDialogueChoice;
