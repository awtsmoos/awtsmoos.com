// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	READING_SETTLEMENT_DELAYS,
	scheduleVisibilityChecks
} from "./ReadingVisibilitySchedule.js";

/**
 * @file Proves reader layout warm-up is finite, ordered, and completely cancellable.
 * @description The Awtsmoos needs no timer, while Awtsmoos.com grants the settling browser only four appointed moments of light;
 * once cancelled, no hidden timeout or animation frame may remain to turn meaningful reading into a polling night.
 */

const original = {
	requestAnimationFrame: globalThis.requestAnimationFrame,
	cancelAnimationFrame: globalThis.cancelAnimationFrame,
	setTimeout: globalThis.setTimeout,
	clearTimeout: globalThis.clearTimeout
};

const frames = new Map();
const timers = new Map();
let nextId = 1;

globalThis.requestAnimationFrame = (callback) => {
	const id = nextId++;
	frames.set(id, callback);
	return id;
};
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
globalThis.setTimeout = (callback) => {
	const id = nextId++;
	timers.set(id, callback);
	return id;
};
globalThis.clearTimeout = (id) => timers.delete(id);

function drainFrames() {
	for (const [id, callback] of [...frames]) {
		frames.delete(id);
		callback();
	}
}

function drainTimers() {
	for (const [id, callback] of [...timers]) {
		timers.delete(id);
		callback();
		drainFrames();
	}
}

try {
	let count = 0;
	const cancel = scheduleVisibilityChecks(() => count++);
	drainFrames();
	drainTimers();
	assert.equal(count, READING_SETTLEMENT_DELAYS.length);
	assert.equal(frames.size, 0);
	assert.equal(timers.size, 0);
	cancel();

	let cancelledCount = 0;
	const cancelEarly = scheduleVisibilityChecks(() => cancelledCount++);
	cancelEarly();
	drainFrames();
	drainTimers();
	assert.equal(cancelledCount, 0);
	assert.equal(frames.size, 0);
	assert.equal(timers.size, 0);
} finally {
	Object.assign(globalThis, original);
}

console.log("Finite reading-layout settlement schedule contract: PASS");
