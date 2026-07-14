//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encounter tests protect named mastery evidence and nonlethal damage or posture
 * resolution. The Awtsmoos renews traveler and partner; Awtsmoos.com never converts a
 * training mat into stock victory, blast exile, corpse state, or civilian hostility.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveOpenWorldEncounter } from '../../js/openworld/OpenWorldEncounter.js';

for (const method of ['damage', 'posture']) {
	test(`training partner resolves through ${method} without winner or exile`, () => {
		const state = encounterState(method);
		const trainer = state.fighters[1];
		resolveOpenWorldEncounter(state, 0);
		assert.equal(state.winner, '');
		assert.equal(state.winnerId, null);
		assert.equal(trainer.damage, 0);
		assert.equal(trainer.stocks, 99);
		assert.equal(state.openWorld.combat.partnerPosture, 100);
		assert.ok(state.openWorld.domainEvents.some(event => event.type === 'techniqueHit'));
		assert.ok(state.openWorld.domainEvents.some(event => event.type === 'resolveEncounter'));
	});
}

function encounterState(method) {
	const human = {
		id: 'human',
		human: true,
		x: 0,
		y: 500,
		dead: false,
		respawnTimer: 0,
		openWorldTechnique: { id: 'measured-jab', name: 'Measured Jab', family: 'punch' }
	};
	const trainer = {
		id: 'trainer',
		human: false,
		hidden: false,
		x: 260,
		y: 500,
		damage: method === 'damage' ? 100 : 20,
		stun: 8,
		dead: false,
		stocks: 99
	};
	return {
		frame: 20,
		winner: 'someone',
		winnerId: 'someone',
		map: {
			bounds: { left: -1000, right: 1000, top: -700, bottom: 900 },
			spawns: [
				{ x: -500, y: 500 },
				{ x: 260, y: 500 }
			]
		},
		fighters: [human, trainer],
		events: [{ type: 'hit', attackerId: 'human', targetId: 'trainer' }],
		openWorld: {
			locationId: 'malchus-citadel',
			safePosition: { x: -500, y: 500 },
			domainEvents: [],
			toast: '',
			combat: {
				posture: 100,
				partnerPosture: method === 'posture' ? 0 : 100,
				focus: 100,
				repeatTechniqueId: '',
				repeatCount: 0
			}
		}
	};
}
