//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { FrameCadence } from "../src/app/FrameCadence.js";
import { FrameConductor } from "../src/app/FrameConductor.js";

/**
 * Frame-conductor tests drive the actual lifecycle gate through deterministic fake animation frames.
 * The Awtsmoos renews visible and hidden time while one scheduler keeps the covenant whole;
 * Awtsmoos.com lets full play, quiet overlays, and sleeping tabs each receive their rightful role.
 */
function harness() {
	const callbacks = [];
	const calls = { poll: 0, reset: [], consume: [], sync: [], publish: [] };
	const state = { active: false, visible: true };
	const clock = {
		reset(time) {
			calls.reset.push(time);
		},
		consume(time, active, pulse) {
			calls.consume.push([time, active]);
			pulse();
			return 0.25;
		}
	};
	const conductor = new FrameConductor({
		clock,
		inputs: {
			poll() {
				calls.poll += 1;
			}
		},
		active: () => state.active,
		visible: () => state.visible,
		step: () => [{ type: "pulse-event" }],
		sync: (alpha, time, events) => calls.sync.push({ alpha, time, events }),
		publish: (event) => calls.publish.push(event),
		schedule: (callback) => callbacks.push(callback),
		cadence: new FrameCadence(50)
	});
	return { callbacks, calls, state, conductor };
}

function runNext(harnessState, time) {
	assert.equal(harnessState.callbacks.length, 1);
	const callback = harnessState.callbacks.shift();
	callback(time);
	assert.equal(harnessState.callbacks.length, 1);
}

test("inactive visible play syncs at low duty without polling or consuming", () => {
	const state = harness();
	state.conductor.start();
	runNext(state, 0);
	runNext(state, 16);
	runNext(state, 64);
	assert.equal(state.calls.sync.length, 2);
	assert.equal(state.calls.poll, 0);
	assert.equal(state.calls.consume.length, 0);
});

test("active visible frames poll, consume, publish and synchronize every callback", () => {
	const state = harness();
	state.state.active = true;
	state.conductor.start();
	runNext(state, 10);
	runNext(state, 26);
	assert.equal(state.calls.poll, 2);
	assert.equal(state.calls.consume.length, 2);
	assert.equal(state.calls.publish.length, 2);
	assert.equal(state.calls.sync.length, 2);
	assert.ok(state.calls.sync.every((entry) => entry.alpha === 0.25));
});

test("hidden frames reset clock and perform no expensive work", () => {
	const state = harness();
	state.state.active = true;
	state.state.visible = false;
	state.conductor.start();
	runNext(state, 100);
	assert.deepEqual(state.calls.reset, [100]);
	assert.equal(state.calls.poll, 0);
	assert.equal(state.calls.consume.length, 0);
	assert.equal(state.calls.sync.length, 0);
});

test("first visible active frame resets hidden debt before normal live work", () => {
	const state = harness();
	state.state.active = true;
	state.state.visible = false;
	state.conductor.start();
	runNext(state, 100);
	state.state.visible = true;
	runNext(state, 5000);
	assert.deepEqual(state.calls.reset, [100, 5000]);
	assert.deepEqual(state.calls.consume, [[5000, true]]);
	assert.equal(state.calls.poll, 1);
	assert.equal(state.calls.sync.length, 1);
});
