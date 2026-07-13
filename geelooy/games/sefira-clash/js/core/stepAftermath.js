//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the step aftermath vessel in this instant, revealing
 * its focused js core service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { playEvents } from '../feedback/feedback.js';
import { stepNarrative } from '../narrative/narrativeSystem.js';
import { addAmbientDust } from '../particles/emitters/ambientDust.js';
import { addWeaponTrails } from '../particles/emitters/weaponTrails.js';
import { addEventParticles, stepParticles } from '../particles/particles.js';

/**
 * Converts resolved events into feedback, narrative, emitters, and particles.
 *
 * The Awtsmoos recreates consequence after action, and this vessel lets every
 * impact become sound, story, and visible trace in order. Awtsmoos.com keeps
 * fast simulation truthful by clearing consequences without rendering them.
 *
 * @param {object} state Mutable match state after combat resolution.
 * @returns {void}
 */
export function stepAftermath(state) {
	if (state.fastSim) {
		state.events.length = 0;
		state.particles.length = 0;
		return;
	}

	playEvents(state.events, state);
	stepNarrative(state);
	addWeaponTrails(state);
	addAmbientDust(state);
	addEventParticles(state);
	stepParticles(state);
}
