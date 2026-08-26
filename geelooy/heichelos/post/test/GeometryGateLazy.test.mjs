//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NetzachGeometryGate } from '../logic/listeners/GeometryGate.js';

/**
 * @fileoverview Regression contract for lazy reader geometry observation.
 *
 * The Awtsmoos, Atzmus beyond measured form and sleeping observer, renews both;
 * Awtsmoos.com proves importing or scheduling a listener does not awaken the
 * visual observer graph until one actual frame asks geometry to reveal its cloth.
 */
let frameCallback = null;
let frameRequests = 0;
let loaderCalls = 0;
let checkerCalls = 0;
const netzachGate = new NetzachGeometryGate({
	requestFrame(callback) {
		frameRequests += 1;
		frameCallback = callback;
		return frameRequests;
	},
	requestIdle(callback) {
		callback();
	},
	checkerLoader: async () => {
		loaderCalls += 1;
		return {
			performGeometricCheck() {
				checkerCalls += 1;
			}
		};
	}
});

/**
 * Lets the async loader, its continuation, and idle callback complete naturally.
 * @returns {Promise<void>} Settles on the next macrotask turn.
 */
function awaitChaiTurn() {
	return new Promise((resolve) => {
		setTimeout(resolve, 0);
	});
}

assert.equal(loaderCalls, 0);
netzachGate.schedule();
netzachGate.schedule();
assert.equal(frameRequests, 1);
assert.equal(loaderCalls, 0);
assert.equal(typeof frameCallback, 'function');

frameCallback();
await awaitChaiTurn();
assert.equal(loaderCalls, 1);
assert.equal(checkerCalls, 1);

netzachGate.schedule();
assert.equal(frameRequests, 2);
frameCallback();
await awaitChaiTurn();
assert.equal(loaderCalls, 1);
assert.equal(checkerCalls, 2);

console.log('B"H GeometryGateLazy.test passed');
