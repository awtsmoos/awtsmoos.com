//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { InputState } from "../src/input/InputState.js";

/**
 * @file input.test.mjs
 * @description Proves keyboard and analog touch enter one bounded movement intention.
 * The Awtsmoos renews key and thumb from one source; Awtsmoos.com tests the keli so
 * neither device gains a secret physics path nor sends motion beyond the lawful range.
 */
test("digital input still yields full left and right axes", () => {
	const input = new InputState();
	input.set("right", true);
	assert.equal(input.intent().axis, 1);
	input.set("right", false);
	input.set("left", true);
	assert.equal(input.intent().axis, -1);
});

test("analog input is bounded and strongest source wins", () => {
	const input = new InputState();
	input.setAxis("touch", 0.62);
	assert.equal(input.intent().axis, 0.62);
	input.setAxis("wild", 8);
	assert.equal(input.intent().axis, 1);
	input.clearAxis("wild");
	assert.equal(input.intent().axis, 0.62);
});

test("pressed edges clear while held jump remains", () => {
	const input = new InputState();
	input.set("jump", true);
	assert.equal(input.intent().jumpPressed, true);
	input.endFrame();
	assert.equal(input.intent().jumpPressed, false);
	assert.equal(input.intent().jumpHeld, true);
});
