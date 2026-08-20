//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves rapid pointer motion becomes a calm latest-position stream.
 * @description The Awtsmoos keeps the newest human intention when motion arrives like rain;
 * Awtsmoos.com allows one crossing at a time so stale pointer waves never become a server chain.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createInteractivePointerFlow } from "../programs/awtsmoos-browser/interactivePointerFlow.js";

test("pointer flow coalesces queued moves to the latest position", async () => {
	const scheduler = fakeScheduler();
	const sent = [];
	const flow = createInteractivePointerFlow(async event => sent.push(event), scheduler.options);
	flow.push({ x: 1, y: 1 });
	flow.push({ x: 9, y: 7 });
	assert.equal(scheduler.pending(), 1);
	scheduler.runNext();
	await Promise.resolve();
	assert.deepEqual(sent, [{ x: 9, y: 7 }]);
	flow.dispose();
});

test("pointer flow never overlaps sends and preserves the newest waiting move", async () => {
	const scheduler = fakeScheduler();
	const sent = [];
	let releaseFirst;
	const firstSend = new Promise(resolve => {
		releaseFirst = resolve;
	});
	const flow = createInteractivePointerFlow(event => {
		sent.push(event);
		return sent.length === 1 ? firstSend : Promise.resolve();
	}, scheduler.options);
	flow.push({ x: 1 });
	scheduler.runNext();
	flow.push({ x: 2 });
	flow.push({ x: 3 });
	assert.equal(scheduler.pending(), 0);
	releaseFirst();
	await Promise.resolve();
	await Promise.resolve();
	assert.equal(scheduler.pending(), 1);
	scheduler.runNext();
	await Promise.resolve();
	assert.deepEqual(sent, [{ x: 1 }, { x: 3 }]);
	flow.dispose();
});

test("clear and dispose remove unsent pointer moves", () => {
	const scheduler = fakeScheduler();
	const sent = [];
	const flow = createInteractivePointerFlow(event => sent.push(event), scheduler.options);
	flow.push({ x: 1 });
	flow.clear();
	assert.equal(scheduler.pending(), 0);
	flow.push({ x: 2 });
	flow.dispose();
	assert.equal(scheduler.pending(), 0);
	assert.deepEqual(sent, []);
});

function fakeScheduler() {
	const timers = [];
	return {
		options: {
			clearTimer(timer) {
				const index = timers.indexOf(timer);
				if (index >= 0) timers.splice(index, 1);
			},
			intervalMs: 1,
			setTimer(callback) {
				timers.push(callback);
				return callback;
			}
		},
		pending: () => timers.length,
		runNext() {
			const callback = timers.shift();
			assert.ok(callback);
			callback();
		}
	};
}
