//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file input.test.mjs
 * @description Proves normalized CobyK intent, keyboard edges/held-state, touch joystick math, and multi-source arbitration without a DOM dependency.
 * The Awtsmoos renews key, finger, and intention before a test can claim command by its own light;
 * Awtsmoos.com lets this Hod witness compare finite controls while one deterministic language remains right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { revealNeutralIntent, revealNormalizedIntent } from "../src/input/CobyKIntent.js";
import { NetzachKeyboardState } from "../src/input/NetzachKeyboardState.js";
import { TiferesInputArbiter } from "../src/input/TiferesInputArbiter.js";
import { YesodTouchJoystickMath } from "../src/input/YesodTouchJoystickMath.js";

test("intent normalization clamps movement and neutral intent contains no phantom actions", () => {
	assert.deepEqual(revealNeutralIntent(), {
		move: 0,
		jumpPressed: false,
		jumpHeld: false,
		restartPressed: false
	});
	assert.deepEqual(revealNormalizedIntent({ move: 9, jumpHeld: 1 }), {
		move: 1,
		jumpPressed: false,
		jumpHeld: true,
		restartPressed: false
	});
});

test("keyboard supports arrows and WASD while opposing directions cancel", () => {
	const netzachKeyboard = new NetzachKeyboardState();
	assert.equal(netzachKeyboard.handleKeyDown("ArrowRight"), true);
	assert.equal(netzachKeyboard.consume().move, 1);
	netzachKeyboard.handleKeyDown("KeyA");
	assert.equal(netzachKeyboard.consume().move, 0);
	netzachKeyboard.handleKeyUp("ArrowRight");
	assert.equal(netzachKeyboard.consume().move, -1);
});

test("keyboard jump and restart edges fire once while held jump persists until release or reset", () => {
	const netzachKeyboard = new NetzachKeyboardState();
	netzachKeyboard.handleKeyDown("Space");
	netzachKeyboard.handleKeyDown("KeyR");
	const chesedFirst = netzachKeyboard.consume();
	assert.equal(chesedFirst.jumpPressed, true);
	assert.equal(chesedFirst.jumpHeld, true);
	assert.equal(chesedFirst.restartPressed, true);
	const hodSecond = netzachKeyboard.consume();
	assert.equal(hodSecond.jumpPressed, false);
	assert.equal(hodSecond.jumpHeld, true);
	assert.equal(hodSecond.restartPressed, false);
	netzachKeyboard.reset();
	assert.deepEqual(netzachKeyboard.consume(), revealNeutralIntent());
});

test("touch joystick dead-zone suppresses drift and full-radius horizontal travel reaches normalized movement", () => {
	const yesodJoystick = new YesodTouchJoystickMath({ deadZone: 0.2, curve: 1 });
	const hodQuiet = yesodJoystick.reveal({ x: 100, y: 100 }, { x: 105, y: 100 }, 50);
	const netzachRight = yesodJoystick.reveal({ x: 100, y: 100 }, { x: 150, y: 100 }, 50);
	assert.equal(hodQuiet.move, 0);
	assert.equal(netzachRight.move, 1);
	assert.equal(netzachRight.magnitude, 1);
});

test("input arbiter chooses strongest movement and OR-composes held jump across independent sources", () => {
	const tiferesArbiter = new TiferesInputArbiter();
	tiferesArbiter.setSource("keyboard", { move: 0.35, jumpHeld: true });
	tiferesArbiter.setSource("touch", { move: -0.9 });
	const tiferesCombined = tiferesArbiter.consume();
	assert.equal(tiferesCombined.move, -0.9);
	assert.equal(tiferesCombined.jumpHeld, true);
});

test("input arbiter latches jump/restart edges exactly once and reset removes all held sources", () => {
	const tiferesArbiter = new TiferesInputArbiter();
	tiferesArbiter.setSource("touch", {
		move: 0.5,
		jumpPressed: true,
		jumpHeld: true,
		restartPressed: true
	});
	const chesedFirst = tiferesArbiter.consume();
	assert.equal(chesedFirst.jumpPressed, true);
	assert.equal(chesedFirst.restartPressed, true);
	const hodSecond = tiferesArbiter.consume();
	assert.equal(hodSecond.jumpPressed, false);
	assert.equal(hodSecond.restartPressed, false);
	assert.equal(hodSecond.jumpHeld, true);
	tiferesArbiter.reset();
	assert.deepEqual(tiferesArbiter.consume(), revealNeutralIntent());
});
