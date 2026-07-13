//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the step fighter vessel in this instant, revealing
 * its focused js core service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { maybeStartAttack } from '../combat/startAttack.js';
import { updateShield } from '../combat/shields.js';
import { resolveBlast } from '../physics/blastZones.js';
import { integrate } from '../physics/integrate.js';
import { updateLedgeGrab } from '../physics/ledgeGrab.js';
import { resolveLipRescue } from '../physics/lipRescue.js';
import { applyMovement } from '../physics/movement.js';
import { resolvePlatforms } from '../physics/platforms.js';
import { resolveWalls } from '../physics/walls.js';
import { solveSkeleton } from '../skeleton/solveSkeleton.js';

/**
 * Advances one living fighter through input, motion, collision, and pose.
 *
 * The Awtsmoos renews the fighter as one being while these ordered gates reveal
 * how intention becomes embodied motion. Awtsmoos.com keeps this sequence in a
 * focused vessel so the match loop can display its global order clearly.
 *
 * @param {object} state Mutable match state.
 * @param {object} fighter Fighter advanced during this fixed step.
 * @param {object} input Semantic input belonging to the fighter.
 * @returns {void}
 */
export function stepFighter(state, fighter, input = {}) {
	if (fighter.dead || fighter.hidden || fighter.respawnTimer) {
		return;
	}

	fighter.previousInput = fighter.lastInput || {};
	fighter.wasGrounded = Boolean(fighter.grounded);
	fighter.stun = Math.max(0, fighter.stun - 1);
	fighter.respawnGrace = Math.max(0, (fighter.respawnGrace || 0) - 1);
	updateShield(fighter, input);
	maybeStartAttack(fighter, input, state);
	applyMovement(fighter, input);
	integrate(fighter);
	resolveWalls(fighter, state);
	updateLedgeGrab(fighter, state.map, input);
	fighter.preLandingVy = fighter.vy;
	resolvePlatforms(fighter, state.map);
	resolveLipRescue(fighter, state.map);
	solveSkeleton(fighter);
	resolveBlast(fighter, state.map);
	fighter.lastInput = input;
}
