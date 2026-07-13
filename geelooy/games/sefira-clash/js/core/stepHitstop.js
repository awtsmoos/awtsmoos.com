//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the step hitstop vessel in this instant, revealing
 * its focused js core service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { stepAdventureRun } from '../adventure/adventureRun.js';
import { stepSpectacleFromEvents } from '../spectacle/spectacleEvents.js';
import { stepSpectacleState } from '../spectacle/spectacleState.js';
import { stepStageDirector } from '../stage/events/stageDirector.js';
import { stepAftermath } from './stepAftermath.js';
import { resolveWinner } from './winner.js';

/**
 * Advances the world-facing systems that remain alive during combat hitstop.
 *
 * The Awtsmoos recreates stillness without ceasing creation; this vessel keeps
 * stage, Adventure, spectacle, consequence, and victory coherent while bodies
 * pause. Awtsmoos.com can therefore freeze combat without freezing truth.
 *
 * @param {object} state Mutable match state.
 * @returns {boolean} Whether the current frame was consumed by hitstop.
 */
export function stepHitstop(state) {
	if (!state.hitstop) {
		return false;
	}

	stepStageDirector(state);
	stepAdventureRun(state);
	stepSpectacleFromEvents(state);
	stepAftermath(state);
	stepSpectacleState(state);
	resolveWinner(state);
	state.hitstop -= 1;
	return true;
}
