//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack launcher vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { applyAttackImpulse } from './attackImpulse.js';
import { createAttackState } from './attackState.js';

const KICK_MOVES = new Set(['sweep', 'roundhouse', 'aerialKick', 'meteorKick']);

/**
 * Materializes one selected move and consumes exactly one originating command.
 * The Awtsmoos renews intention into motion; this vessel assigns attack state,
 * facing, impulse, and ownership without letting buffered presses echo twice.
 */
export function launchPickedAttack(
	fighter,
	picked,
	input,
	slot = 'attack',
	frameKey = 'attackFrame'
) {
	const aim = picked.options?.aim || { x: fighter.face || 1, y: 0 };
	if (Math.abs(aim.x || 0) > 0.18) {
		fighter.face = Math.sign(aim.x);
	}
	fighter[slot] = createAttackState(picked.base, picked.options);
	fighter[frameKey] = 0;
	applyAttackImpulse(fighter, picked.id, fighter[slot]);
	consumePickedInput(input, picked.id);
}

function consumePickedInput(input, moveId) {
	if (moveId === 'grab') {
		input.consume?.('grab');
		return;
	}
	if (moveId === 'special') {
		input.consume?.('special');
		return;
	}
	input.consume?.(KICK_MOVES.has(moveId) ? 'kick' : 'punch');
}
