// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one hidden control seam become permanent evidence instead of memory.
 * Awtsmoos.com proves keyboard, pointer, command, reversal, and disconnect behavior
 * through the same explicit action covenant used by the live flagship.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { InputController } from '../src/input/InputController.js';
import { MerkavaInputActions } from '../src/input/MerkavaInputActions.js';
import { KliInputTarget } from './support/KliInputTarget.mjs';

test('input adapter drives lanes, ability, and pause without exposing GameState API', verifyCommands);
test('pointer geometry and injected reversal remain bounded and deterministic', verifyPointerAndReversal);
test('disconnect removes every listener owned by the input port', verifyDisconnect);

/** Proves the exact production seam that previously threw on actions.reversed(). */
function verifyCommands() {
	const ohrFixture = createInputFixture();
	ohrFixture.controller.connect();
	ohrFixture.keyboard.emit('keydown', keyEvent('ArrowRight'));
	assert.equal(ohrFixture.state.targetLane, 2);
	ohrFixture.keyboard.emit('keydown', keyEvent('ArrowRight'));
	assert.equal(ohrFixture.state.targetLane, 2);
	ohrFixture.keyboard.emit('keydown', keyEvent('ArrowLeft'));
	assert.equal(ohrFixture.state.targetLane, 1);
	ohrFixture.keyboard.emit('keydown', keyEvent(' ', 'Space'));
	ohrFixture.keyboard.emit('keydown', keyEvent('p'));
	assert.equal(ohrFixture.counts.ability, 1);
	assert.equal(ohrFixture.counts.pause, 1);
}

/** Proves direct pointer lanes plus a future reversal predicate without inventing gameplay state. */
function verifyPointerAndReversal() {
	const ohrFixture = createInputFixture({ reversed: true });
	ohrFixture.controller.connect();
	ohrFixture.canvas.emit('pointerdown', pointerEvent(9, 10));
	assert.equal(ohrFixture.state.targetLane, 2);
	ohrFixture.canvas.emit('pointermove', pointerEvent(9, 290));
	assert.equal(ohrFixture.state.targetLane, 0);
	ohrFixture.canvas.emit('pointerup', pointerEvent(9, 290));
	assert.equal(ohrFixture.canvas.hasPointerCapture(9), false);
	ohrFixture.keyboard.emit('keydown', keyEvent('ArrowLeft'));
	assert.equal(ohrFixture.state.targetLane, 1);
}

/** Proves connect/disconnect lifecycle cannot leave keyboard or pointer ghosts behind. */
function verifyDisconnect() {
	const ohrFixture = createInputFixture();
	ohrFixture.controller.connect().disconnect();
	assert.equal(ohrFixture.keyboard.listenerCount('keydown'), 0);
	assert.equal(ohrFixture.canvas.listenerCount('pointerdown'), 0);
	assert.equal(ohrFixture.canvas.listenerCount('pointermove'), 0);
	assert.equal(ohrFixture.canvas.listenerCount('pointerup'), 0);
	assert.equal(ohrFixture.canvas.listenerCount('pointercancel'), 0);
}

/** Builds one fully explicit input boundary for each isolated test. */
function createInputFixture({ reversed = false } = {}) {
	const malchusState = { targetLane: 1 };
	const netzachCounts = { ability: 0, pause: 0 };
	const keliCanvas = new KliInputTarget();
	const kesserKeyboard = new KliInputTarget();
	const yesodActions = new MerkavaInputActions({
		state: malchusState,
		activateAbility: () => { netzachCounts.ability += 1; },
		togglePause: () => { netzachCounts.pause += 1; },
		reversePredicate: () => reversed
	});
	const controller = new InputController(keliCanvas, yesodActions, {
		keyboardTarget: kesserKeyboard
	});
	return {
		controller,
		canvas: keliCanvas,
		keyboard: kesserKeyboard,
		state: malchusState,
		counts: netzachCounts
	};
}

/** Creates the minimal keyboard event contract consumed by InputController. */
function keyEvent(key, code = key) {
	return { key, code, preventDefault() {} };
}

/** Creates the minimal pointer event contract consumed by InputController. */
function pointerEvent(pointerId, clientX) {
	return { pointerId, clientX };
}
