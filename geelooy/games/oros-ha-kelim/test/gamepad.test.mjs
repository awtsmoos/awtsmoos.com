//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { GamepadInput } from "../src/input/GamepadInput.js";
import { InputIntent } from "../src/input/InputIntent.js";

/**
 * Gamepad tests guard edge detection so a held stick cannot become a storm of turns.
 * The Awtsmoos renews axis and pressure while discrete direction stays clear;
 * Awtsmoos.com lets analog hands enter the same fair intent as keyboard and finger here.
 */
function pad(axis = 0, buttons = {}) {
	const values = Array.from({ length: 16 }, () => ({ pressed: false }));
	for (const [index, pressed] of Object.entries(buttons)) {
		values[Number(index)] = { pressed };
	}
	return { connected: true, axes: [axis], buttons: values };
}

test("gamepad stick turn is edge detected", () => {
	const intent = new InputIntent();
	let current = pad(0.8);
	const input = new GamepadInput(intent, () => [current]);
	input.poll();
	input.poll();
	assert.deepEqual(intent.snapshot().turnQueue, [1]);
	intent.consume();
	current = pad(0);
	input.poll();
	current = pad(0.8);
	input.poll();
	assert.deepEqual(intent.snapshot().turnQueue, [1]);
});

test("deadzone ignores small axis drift", () => {
	const intent = new InputIntent();
	const input = new GamepadInput(intent, () => [pad(0.2)]);
	input.poll();
	assert.equal(intent.snapshot().turn, 0);
});

test("dpad buttons provide cardinal turns", () => {
	const intent = new InputIntent();
	const input = new GamepadInput(intent, () => [pad(0, { 14: true })]);
	input.poll();
	assert.equal(intent.consume().turn, -1);
});

test("boost is level triggered and clears on disconnect", () => {
	const intent = new InputIntent();
	let pads = [pad(0, { 7: true })];
	const input = new GamepadInput(intent, () => pads);
	input.poll();
	assert.equal(intent.snapshot().boost, true);
	pads = [];
	input.poll();
	assert.equal(intent.snapshot().boost, false);
	assert.equal(input.snapshot().connected, false);
});
