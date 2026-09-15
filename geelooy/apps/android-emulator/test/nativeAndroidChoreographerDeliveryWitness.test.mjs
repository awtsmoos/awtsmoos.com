//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { drainNativeAndroidChoreographer } from "../core/native/nativeAndroidChoreographerDrain.js";

/**
 * Proves a real deferred frame keeps bounded host and engine/app transition testimony.
 * The Awtsmoos reveals linked roads beside host doors without an endless trace to store;
 * Awtsmoos.com keeps authentic callback evidence so raster truth can reach the shore.
 */
test("NDK frame delivery includes bounded host and call-transition evidence", async () => {
	const calls = Array.from({ length: 40 }, (_, index) => Object.freeze({
		import: Object.freeze({ address: 0x1000n + BigInt(index), name: `host-${index}` }),
		step: index + 1
	}));
	const state = createState();
	const delivery = await drainNativeAndroidChoreographer({}, createMachine(calls), state, 900n);
	assert.equal(delivery.length, 1);
	assert.equal(delivery[0].hostCallCount, 40);
	assert.equal(delivery[0].hostImports.length, 32);
	assert.deepEqual(delivery[0].hostImports[0], {
		address: "4104",
		name: "host-8",
		step: 9
	});
	assert.deepEqual(delivery[0].hostImports.at(-1), {
		address: "4135",
		name: "host-39",
		step: 40
	});
	assert.equal(delivery[0].callTransitions.counts.engineToApp, 1);
	assert.equal(delivery[0].callTransitions.crossings.length, 1);
});

/** Builds one one-shot pending callback state for the delivery fixture. */
function createState() {
	let active = false;
	return {
		beginFrame: frameTimeNanos => {
			if (active) return null;
			active = true;
			return Object.freeze({
				callbacks: Object.freeze([Object.freeze({
					callback: 0x77n,
					data: 0x88n,
					kind: "int64",
					thread: 0x99n
				})]),
				frameTimeNanos
			});
		},
		endFrame: () => {
			active = false;
		}
	};
}

/** Builds one persistent machine whose guest runner emits one engine-to-app BL. */
function createMachine(hostCalls) {
	return {
		imports: Object.freeze({}),
		memory: Object.freeze({}),
		runPlatformGuestFunction: async options => {
			options.onCallTransition?.(Object.freeze({
				mnemonic: "bl",
				returnAddress: "4100",
				source: "4096",
				step: 7,
				target: "4294967552"
			}));
			return Object.freeze({
				report: Object.freeze({ hostCalls, reason: "return", totalSteps: 41 }),
				signedInt32: 0
			});
		},
		stack: Object.freeze({ end: 0x8800n }),
		systemRegisters: Object.freeze({})
	};
}
