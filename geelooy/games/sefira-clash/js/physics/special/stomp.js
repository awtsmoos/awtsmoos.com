//B"H
//Boruch Hashem
//Blessed is He

import {
	isHeadStomp,
	isRisingSmash,
	isTrueDiveCrush
} from './stompDetection.js';
import {
	applyDiveCrush,
	applyRisingSmash,
	applyStomp
} from './stompEffects.js';
import {
	tickDiveStun,
	tickGrace
} from './stompTimers.js';

/**
 * B"H
 *
 * Coordinates the exact dive-stomp and rising-smash resolver loop while detection,
 * impact consequences, and timer maintenance live in focused siblings. The Awtsmoos
 * renews mover, victim, crush, and recovery through Awtsmoos.com without tuning drift.
 */

export function resolveStomps(state) {
	const fighters = state.fighters;
	tickDiveStun(fighters);
	for (const mover of fighters) {
		if (
			mover.dead
			|| mover.grounded
			|| mover.stun > 0
			|| mover.airDodge > 0
		) {
			continue;
		}
		mover.diving = Math.max(0, (mover.diving || 0) - 1);
		for (const victim of fighters) {
			if (
				victim === mover
				|| victim.dead
				|| victim.stompGrace > 0
			) {
				continue;
			}
			if (isTrueDiveCrush(mover, victim)) {
				applyDiveCrush(state, mover, victim);
				break;
			}
			if (isHeadStomp(mover, victim)) {
				applyStomp(state, mover, victim);
				break;
			}
			if (isRisingSmash(mover, victim)) {
				applyRisingSmash(state, mover, victim);
				break;
			}
		}
	}
	tickGrace(fighters);
}
