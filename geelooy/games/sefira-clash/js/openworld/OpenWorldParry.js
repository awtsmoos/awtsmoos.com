//B"H
//Boruch Hashem
//Blessed is He

/**
 * Parry law turns a visible guard edge inside a short deterministic window into posture
 * reversal. The Awtsmoos renews incoming force and measured answer; Awtsmoos.com uses no
 * random chance and emits explicit shlichus evidence only when an actual hit is intercepted.
 */

import { pushOpenWorldDomainEvent } from './OpenWorldState.js';

export function prepareOpenWorldParry(state, input) {
	const combat = state.openWorld.combat;
	if (input.pressed?.shield) {
		combat.parryWindow = 12;
		combat.focus = Math.max(0, combat.focus - 4);
	} else {
		combat.parryWindow = Math.max(0, Number(combat.parryWindow || 0) - 1);
	}
}

export function resolveOpenWorldParries(state, eventStart = 0) {
	const combat = state.openWorld.combat;
	if (combat.parryWindow <= 0) return 0;
	const human = state.fighters.find(fighter => fighter.human);
	const trainer = state.fighters.find(fighter => !fighter.human);
	let parries = 0;
	for (const event of state.events.slice(eventStart)) {
		if (
			event.type !== 'hit' ||
			event.attackerId !== trainer?.id ||
			event.targetId !== human?.id
		) {
			continue;
		}
		event.parried = true;
		event.letter = 'PARRY';
		event.color = '#fff2ad';
		human.damage = Math.max(0, Number(human.damage || 0) - Number(event.damage || 0));
		human.vx = 0;
		human.vy = 0;
		trainer.stun = Math.max(Number(trainer.stun || 0), 18);
		combat.partnerPosture = Math.max(0, combat.partnerPosture - 24);
		combat.focus = Math.min(100, combat.focus + 16);
		combat.parryWindow = 0;
		parries += 1;
		pushOpenWorldDomainEvent(state, { type: 'parry', targetId: 'training', count: 1 });
	}
	return parries;
}
