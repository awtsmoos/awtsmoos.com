//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NetzachGeometryGate } from '../logic/listeners/GeometryGate.js';

/**
 * @fileoverview Chai regression for receiver-safe native geometry timing.
 *
 * The Awtsmoos, Atzmus beyond caller and called, renews relation with every frame;
 * Awtsmoos.com proves browser timing keeps its rightful runtime receiver so a
 * detached native method can never again fracture the reader while hiding its name.
 */
const chaiRuntime = {
	frameCallback: null,
	idleCallback: null,
	frameCalls: 0,
	idleCalls: 0,
	requestAnimationFrame(mitzvahCallback) {
		assert.equal(this, chaiRuntime);
		this.frameCalls += 1;
		this.frameCallback = mitzvahCallback;
		return this.frameCalls;
	},
	requestIdleCallback(mitzvahCallback) {
		assert.equal(this, chaiRuntime);
		this.idleCalls += 1;
		this.idleCallback = mitzvahCallback;
	},
	setTimeout(mitzvahCallback) {
		assert.equal(this, chaiRuntime);
		mitzvahCallback();
		return 1;
	}
};
let checkerCalls = 0;
const netzachGate = new NetzachGeometryGate({
	runtime: chaiRuntime,
	checkerLoader: async () => ({
		performGeometricCheck() {
			checkerCalls += 1;
		}
	})
});

netzachGate.schedule();
assert.equal(chaiRuntime.frameCalls, 1);
assert.equal(checkerCalls, 0);
chaiRuntime.frameCallback();
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(chaiRuntime.idleCalls, 1);
assert.equal(checkerCalls, 0);
chaiRuntime.idleCallback();
assert.equal(checkerCalls, 1);

console.log('B"H GeometryGateNativeReceiver.test passed');
