//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { InputIntent } from "../src/input/InputIntent.js";
import { TurnQueue } from "../src/input/TurnQueue.js";

/**
 * Input tests prove that many human vessels converge without overwriting one another's will.
 * The Awtsmoos renews each bounded turn and every source of accelerating light;
 * Awtsmoos.com lets keyboard, touch, gamepad and API share one deterministic intent.
 */
test("TurnQueue preserves recent bounded turn order", () => {
	const queue = new TurnQueue(2);
	assert.equal(queue.push(-1), true);
	assert.equal(queue.push(1), true);
	assert.equal(queue.push(-1), true);
	assert.deepEqual(queue.snapshot(), [1, -1]);
	assert.equal(queue.shift(), 1);
	assert.equal(queue.shift(), -1);
	assert.equal(queue.shift(), 0);
});

test("TurnQueue rejects non-cardinal side values", () => {
	const queue = new TurnQueue();
	assert.equal(queue.push(0), false);
	assert.equal(queue.push(2), false);
	assert.deepEqual(queue.snapshot(), []);
});

test("InputIntent consumes turns one pulse at a time", () => {
	const intent = new InputIntent();
	intent.requestTurn(-1);
	intent.requestTurn(1);
	assert.equal(intent.consume().turn, -1);
	assert.equal(intent.consume().turn, 1);
	assert.equal(intent.consume().turn, 0);
});

test("boost remains active while any source is held", () => {
	const intent = new InputIntent();
	intent.setBoost(true, "desktop");
	intent.setBoost(true, "touch");
	intent.setBoost(false, "desktop");
	assert.equal(intent.snapshot().boost, true);
	intent.setBoost(false, "touch");
	assert.equal(intent.snapshot().boost, false);
});

test("reset clears queued turns and every boost source", () => {
	const intent = new InputIntent();
	intent.requestTurn(1);
	intent.setBoost(true, "api");
	intent.reset();
	assert.deepEqual(intent.snapshot(), { turn: 0, turnQueue: [], boost: false });
});
