// B"H

import { inspectDestination } from './movement/collision.js';
import { directionForMap } from './movement/directions.js';
import { checkEncounter } from './movement/encounters.js';
import { advanceStep, beginStep } from './movement/interpolation.js';
import { transitionAcrossEdge } from './movement/transition.js';

/**
 * Begins one cardinal tile step after every blocking witness has been heard.
 * @returns {{moved:boolean,reason?:string}} Observable movement result.
 */
export function attemptMove(state, requestedDirection) {
	const direction = directionForMap(state.currentMapId, requestedDirection);
	state.player.direction = direction;
	const destination = inspectDestination(state, direction);

	if (!destination.allowed) {
		state.visualAnim = {
			type: 'bump',
			direction,
			reason: destination.reason,
			startedAt: Date.now()
		};
		return { moved: false, reason: destination.reason };
	}

	beginStep(state, destination, direction);
	state.visualAnim = { type: 'step', direction, startedAt: Date.now() };
	return { moved: true };
}

/**
 * Completes the current step, then reveals transitions and encounters in order.
 * @returns {{completed:boolean,transitioned?:boolean,encountered?:boolean}} Step result.
 */
export function updatePosition(state, deltaTime, trigger) {
	if (!advanceStep(state, deltaTime)) return { completed: false };
	const transitioned = transitionAcrossEdge(state);
	const encountered = transitioned ? false : checkEncounter(state, trigger);
	return { completed: true, transitioned, encountered };
}
