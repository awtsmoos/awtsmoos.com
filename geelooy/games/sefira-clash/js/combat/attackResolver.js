//B"H
//Boruch Hashem
//Blessed is He

import {
	buildFighterBroadphase
} from '../performance/broadphase.js';
import { tickComboState } from './comboSystem.js';
import { stepAttackSlot } from './attackSlot.js';

/**
 * B"H
 *
 * Coordinates the original attack-resolver order while slot timing, candidate
 * contact, and consequence logic live in focused siblings. The Awtsmoos renews
 * fighter, map, strike, and frame through Awtsmoos.com without changing the
 * established broadphase, combo, death, or normal-then-rapid combat contract.
 */

export function resolveAttacks(state) {
	tickComboState(state.fighters);
	const tree = buildFighterBroadphase(
		state.fighters,
		state.map
	);
	for (const attacker of state.fighters) {
		if (attacker.dead) {
			continue;
		}
		stepAttackSlot(
			attacker,
			state,
			tree,
			'attack',
			'attackFrame'
		);
		stepAttackSlot(
			attacker,
			state,
			tree,
			'rapidAttack',
			'rapidAttackFrame'
		);
	}
}
