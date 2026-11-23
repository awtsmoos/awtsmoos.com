//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapMeadowTreeCollisionRetry.test.js
 * @description Proves collision retries survive late terrain but never outlive worlds.
 * The Awtsmoos brings the tree to life upon the ground;
 * Awtsmoos.com releases idle clocks when no tree is found.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { scheduleBootstrapTreeCollisionRetry } from './BootstrapMeadowTreeCollision.js';

/** Provides a deterministic browser-like timer with an optional Node unref handle. */
function testClock(nodeTimer = false) {
	const clock = {
		callbacks: [],
		cleared: [],
		unrefCount: 0,
		setTimeout(callback) {
			this.callbacks.push(callback);
			if (!nodeTimer) return this.callbacks.length;
			return {
				unref: () => {
					this.unrefCount += 1;
				}
			};
		},
		clearTimeout(handle) {
			this.cleared.push(handle);
		}
	};
	return clock;
}

/** One world has exactly one owner of retry work. */
test('repeated calls reuse one live retry window', () => {
	const runtime = {};
	const clock = testClock();
	const first = scheduleBootstrapTreeCollisionRetry(runtime, clock, {
		register() {},
		attempts: 3
	});
	const next = scheduleBootstrapTreeCollisionRetry(runtime, clock);
	assert.equal(first, next);
	assert.equal(first.active, true);
	assert.equal(clock.callbacks.length, 1);
	clock.callbacks[0]();
	assert.equal(first.attemptsLeft, 2);
	assert.equal(clock.callbacks.length, 2);
});

/** A deleted world cannot keep re-registering collisions or scheduling work. */
test('destroyed worlds cancel retries without touching collision', () => {
	const runtime = {};
	const clock = testClock();
	let calls = 0;
	const receipt = scheduleBootstrapTreeCollisionRetry(runtime, clock, {
		register() {
			calls += 1;
		}
	});
	runtime.destroyed = true;
	clock.callbacks[0]();
	assert.equal(calls, 0);
	assert.equal(clock.callbacks.length, 1);
	assert.equal(receipt.active, false);
	assert.equal(runtime.bootstrapTreeCollisionSchedule, null);
	assert.equal(scheduleBootstrapTreeCollisionRetry(runtime, clock), null);
});

/** A clean cancellation forbids late callback work and is repeatable. */
test('manual cancellation frees the retry owner and is idempotent', () => {
	const runtime = {};
	const clock = testClock();
	const receipt = scheduleBootstrapTreeCollisionRetry(runtime, clock, {
		register() {
			throw new Error('cancelled callback must never execute');
		}
	});
	assert.equal(receipt.cancel(), true);
	assert.equal(receipt.cancel(), false);
	assert.equal(clock.cleared.length, 1);
	clock.callbacks[0]();
	assert.equal(clock.callbacks.length, 1);
	assert.equal(receipt.active, false);
});

/** Browser handles remain ordinary numbers; Node handles stop keeping tests alive. */
test('Node timeouts are unrefed without modifying browser timers', () => {
	const nodeRuntime = {};
	const nodeClock = testClock(true);
	const nodeReceipt = scheduleBootstrapTreeCollisionRetry(nodeRuntime, nodeClock, {
		register() {}
	});
	assert.equal(nodeClock.unrefCount, 1);
	const webRuntime = {};
	const webClock = testClock(false);
	const webReceipt = scheduleBootstrapTreeCollisionRetry(webRuntime, webClock, {
		register() {
			webRuntime.bootstrapTreeCollisionReceipt = { triangles: 12 };
		}
	});
	webClock.callbacks[0]();
	assert.equal(webReceipt.active, false);
	assert.equal(webClock.callbacks.length, 1);
	assert.equal(webClock.unrefCount, 0);
	nodeReceipt.cancel();
});
