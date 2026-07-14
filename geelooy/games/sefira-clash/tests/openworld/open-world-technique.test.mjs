//B"H
//Boruch Hashem
//Blessed is He

/**
 * Technique tests protect interaction edges and stamina-bound hand and foot rhythm. The
 * Awtsmoos renews every strike; Awtsmoos.com names existing attack intent without
 * applying trainer ranks to competitive VS state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InputBuffer } from '../../js/controls/InputBuffer.js';
import { prepareOpenWorldInput } from '../../js/openworld/OpenWorldTechnique.js';

test('interaction is buffered as one semantic edge', () => {
	const buffer = new InputBuffer();
	const first = buffer.read(rawInput({ interact: true }));
	const held = buffer.read(rawInput({ interact: true }));
	const released = buffer.read(rawInput({ interact: false }));
	assert.equal(first.pressed.interact, true);
	assert.equal(held.pressed.interact, false);
	assert.equal(released.released.interact, true);
});

test('ranked punch chain spends stamina and names existing attack intent', () => {
	const state = techniqueState(3, 1);
	const human = { face: 1 };
	const first = prepareOpenWorldInput(state, human, attackInput('punch'));
	const second = prepareOpenWorldInput(state, human, attackInput('punch'));
	const third = prepareOpenWorldInput(state, human, attackInput('punch'));
	assert.equal(first.punch, true);
	assert.equal(second.aimX, 1);
	assert.equal(third.aimY, -1);
	assert.equal(human.openWorldTechnique.id, 'rising-answer');
	assert.ok(state.openWorld.combat.stamina < 70);
});

function techniqueState(punchRank, kickRank) {
	return {
		frame: 1,
		openWorld: {
			techniqueRanks: { punch: punchRank, kick: kickRank },
			toast: '',
			combat: {
				stamina: 100,
				focus: 100,
				chainFamily: '',
				chainStep: 0,
				chainWindow: 0
			}
		}
	};
}

function attackInput(family) {
	return {
		...rawInput({ [family]: true }),
		pressed: { [family]: true },
		buffered: { [family]: true }
	};
}

function rawInput(overrides = {}) {
	return {
		x: 0,
		y: 0,
		aimX: 0,
		aimY: 0,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false,
		interact: false,
		...overrides
	};
}
