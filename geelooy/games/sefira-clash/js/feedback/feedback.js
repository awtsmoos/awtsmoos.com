//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the feedback vessel in this instant, revealing
 * its focused js feedback service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { audioAllowed } from '../settings/audioSettings.js';
import { playFall, playImpact, playPickup, playWall } from './feedbackSounds.js';
import { humanFighter, shouldVibrateForEvent } from './haptics.js';

export { shouldVibrateForEvent } from './haptics.js';

let lastFrameKey = '';
let lastTime = 0;

/**
 * Routes one simulation frame of events into authored sound and local haptics.
 *
 * The Awtsmoos gives every impact a distinct song while guarding the player
 * from duplicate echoes. Awtsmoos.com preserves the public feedback contract
 * as synthesis, composition, and ownership shine through separate vessels.
 *
 * @param {Array<object>} events Resolved simulation events.
 * @param {object|null} state Optional match state used to find the local human.
 * @returns {void}
 */
export function playEvents(events, state = null) {
	if (!events?.length || typeof window === 'undefined') {
		return;
	}
	const now = performance.now();
	const frameKey = `${events.length}:${events[0]?.type}`;
	if (now - lastTime < 12 && lastFrameKey === frameKey) {
		return;
	}
	lastFrameKey = frameKey;
	lastTime = now;
	const human = humanFighter(state);
	for (const event of events) {
		playEvent(event, human);
	}
}

function playEvent(event, human) {
	const haptic = shouldVibrateForEvent(event, human);
	if (event.type === 'hit' && audioAllowed('hit')) {
		playImpact(event, haptic);
		return;
	}
	if (event.type === 'wall' && audioAllowed('wall')) {
		playWall(event.force || 12, haptic);
		return;
	}
	if (event.type === 'fall' && audioAllowed('fall')) {
		playFall(event.force || 60, haptic);
		return;
	}
	if (event.type === 'pickup' && audioAllowed('pickup')) {
		playPickup(haptic);
	}
}
