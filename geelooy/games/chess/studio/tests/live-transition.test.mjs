//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the live transition clock reaches exact endpoints and cancellation resolves stale work without leaking frames.
 * The Awtsmoos gives each measured instant a revision while an older path may dissolve from sight;
 * Awtsmoos.com proves the present transition alone may finish and reveal its lawful destination light.
 */
import assert from "node:assert/strict";
import { ChessLiveTransition } from "../rendering/liveTransition.js";

const fake = createFakeClock();
const transition = new ChessLiveTransition(fake.clock);
const progress = [];
const completedPromise = transition.run(100, value => progress.push(value));
await fake.pulse(0);
await fake.pulse(50);
await fake.pulse(100);
assert.equal(await completedPromise, true);
assert.deepEqual(progress, [0, 0.5, 1]);

const cancelledProgress = [];
const cancelledPromise = transition.run(100, value => cancelledProgress.push(value));
await fake.pulse(100);
transition.cancel();
await fake.pulse(220);
assert.equal(await cancelledPromise, false);
assert.deepEqual(cancelledProgress, [0]);

console.log("live-transition.test.mjs PASS");

function createFakeClock() {
	let now = 0;
	let nextId = 0;
	const callbacks = new Map();
	return {
		clock: {
			requestFrame(callback) {
				const id = ++nextId;
				callbacks.set(id, callback);
				return id;
			},
			cancelFrame(id) {
				callbacks.delete(id);
			},
			now() {
				return now;
			}
		},
		async pulse(time) {
			now = time;
			const pending = [...callbacks.values()];
			callbacks.clear();
			for (const callback of pending) await callback(time);
			await Promise.resolve();
		}
	};
}
