//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the core feel audit vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import assert from 'node:assert/strict';
import {
	createAdventureRun,
	noteAdventurePickup,
	stepAdventureRun
} from '../js/adventure/adventureRun.js';
import { shieldAbsorb, updateShield } from '../js/combat/shields.js';
import { InputBuffer } from '../js/controls/InputBuffer.js';
import { FixedStepClock } from '../js/core/FixedStepClock.js';
import { level56 } from '../js/data/adventure/levels/level56.js';

/**
 * Exercises the rebuilt timing, command memory, defense, and campaign objective spine.
 * Numbers can flatter themselves; behavior must pass through a measured vessel before
 * we claim that the renewing gift of the Awtsmoos has become responsive gameplay.
 */
const simulation = auditClock();
const input = auditInput();
const shield = auditShield();
const adventure = auditAdventure();
console.log(JSON.stringify({ simulation, input, shield, adventure }));

function auditClock() {
	const clock = new FixedStepClock({ hertz: 60, maxSteps: 6 });
	let steps = 0;
	for (let timestamp = 0; timestamp <= 1000; timestamp += 1000 / 120) {
		clock.advance(timestamp, () => {
			steps += 1;
		});
	}
	assert.ok(steps >= 59 && steps <= 60, `Expected about 60 steps, received ${steps}.`);
	return { hertz: 60, simulatedSteps: steps, renderSamples: 121 };
}

function auditInput() {
	const buffer = new InputBuffer(7);
	const first = buffer.read({ punch: true, x: 1 });
	assert.equal(first.pressed.punch, true);
	assert.equal(first.buffered.punch, true);
	const held = buffer.read({ punch: true, x: 1 });
	assert.equal(held.pressed.punch, false);
	assert.equal(held.buffered.punch, true);
	assert.equal(held.consume('punch'), true);
	const consumed = buffer.read({ punch: true, x: 1 });
	assert.equal(consumed.buffered.punch, false);
	return { edgeDetected: true, bufferedFrames: 7, consumedOnce: true };
}

function auditShield() {
	const fighter = {
		shield: 100,
		stats: { shield: 100 },
		attack: null,
		grabbedBy: null,
		stun: 0,
		shieldStun: 0
	};
	updateShield(fighter, { shield: true, pressed: { shield: true } });
	assert.equal(fighter.parryFrames, 3);
	const result = shieldAbsorb(fighter, 12);
	assert.equal(result.parried, true);
	assert.ok(fighter.shield < 100);
	return { parryWindow: 3, shieldDamageApplied: true };
}

function auditAdventure() {
	const run = createAdventureRun(level56);
	const human = {
		id: 'human',
		name: 'YOU',
		human: true,
		dead: false,
		stocks: 3,
		x: level56.adventure.exitPoint.x,
		y: level56.adventure.exitPoint.y
	};
	const state = {
		adventureRun: run,
		fighters: [human],
		events: [],
		winner: ''
	};
	for (let index = 0; index < 10; index += 1) {
		noteAdventurePickup(state, human, { id: 'adventurePeruta', value: 1 });
	}
	stepAdventureRun(state);
	assert.equal(run.perutas, 10);
	assert.equal(run.exitOpen, true);
	assert.equal(run.complete, true);
	assert.equal(state.winner, 'YOU');
	return { perutas: 10, exitOpened: true, completed: true };
}
