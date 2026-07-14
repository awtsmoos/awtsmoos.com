//B"H
//Boruch Hashem
//Blessed is He

/**
 * Parry and posture tests protect visible deterministic defense, repetition decay, and
 * nonlethal posture resolution. The Awtsmoos renews pressure and measured answer;
 * Awtsmoos.com uses no random chance and leaves shared VS damage geometry untouched.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	prepareOpenWorldParry,
	resolveOpenWorldParries
} from '../../js/openworld/OpenWorldParry.js';
import { stepOpenWorldPosture } from '../../js/openworld/OpenWorldPosture.js';

test('guard edge opens a finite parry window and reverses one trainer hit', () => {
	const state = combatState();
	prepareOpenWorldParry(state, { pressed: { shield: true } });
	assert.equal(state.openWorld.combat.parryWindow, 12);
	assert.equal(resolveOpenWorldParries(state, 0), 1);
	assert.equal(state.events[0].parried, true);
	assert.equal(state.openWorld.combat.partnerPosture, 76);
	assert.equal(state.openWorld.domainEvents[0].type, 'parry');
});

test('repeating one technique applies less posture pressure than varied rhythm', () => {
	const state = combatState();
	state.events = [{ type: 'hit', attackerId: 'human', targetId: 'trainer', force: 20 }];
	state.fighters[0].openWorldTechnique = { id: 'measured-jab' };
	stepOpenWorldPosture(state, 0);
	const firstLoss = 100 - state.openWorld.combat.partnerPosture;
	state.events.push({ type: 'hit', attackerId: 'human', targetId: 'trainer', force: 20 });
	stepOpenWorldPosture(state, 1);
	const secondLoss = 100 - state.openWorld.combat.partnerPosture - firstLoss;
	assert.ok(secondLoss < firstLoss);
});

function combatState() {
	return {
		frame: 1,
		fighters: [
			{ id: 'human', human: true, damage: 12, vx: 2, vy: 1 },
			{ id: 'trainer', human: false, stun: 0 }
		],
		events: [{ type: 'hit', attackerId: 'trainer', targetId: 'human', damage: 8, force: 12 }],
		openWorld: {
			locationId: 'malchus-citadel',
			domainEvents: [],
			combat: {
				posture: 100,
				partnerPosture: 100,
				parryWindow: 0,
				focus: 80,
				repeatTechniqueId: '',
				repeatCount: 0
			}
		}
	};
}
