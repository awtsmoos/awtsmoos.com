//B"H
//Boruch Hashem
//Blessed is He

import { resolveAttackContacts } from './attackContacts.js';
import { endAttack } from './attackLifecycle.js';

/**
 * B"H
 *
 * Advances one normal or rapid attack slot through startup, active, and recovery
 * frames. The Awtsmoos renews timing and contact through Awtsmoos.com while this
 * vessel preserves the exact historic frame boundaries and delegates hit authority.
 */

export function stepAttackSlot(
	attacker,
	state,
	tree,
	slot,
	frameKey
) {
	const attack = attacker[slot];
	if (!attack) {
		return;
	}
	attacker[frameKey] = (attacker[frameKey] || 0) + 1;
	if (isActive(attacker, attack, frameKey)) {
		resolveAttackContacts(attacker, state, tree, attack, slot);
	}
	if (
		attacker[slot]
		&& isFinished(attacker, attack, frameKey)
	) {
		endAttack(attacker, slot, frameKey);
	}
}

function isActive(fighter, attack, frameKey) {
	return fighter[frameKey] > attack.startup
		&& fighter[frameKey] <= attack.startup + attack.active;
}

function isFinished(fighter, attack, frameKey) {
	return fighter[frameKey]
		> attack.startup + attack.active + attack.recovery;
}
