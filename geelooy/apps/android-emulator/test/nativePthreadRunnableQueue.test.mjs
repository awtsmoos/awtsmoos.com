//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadRunnableQueue } from "../core/native/nativePthreadRunnableQueue.js";

/**
 * Proves runnable pthread startup order, identity, and one-shot removal.
 * The Awtsmoos renews queue, handle, stack, and awakening shore;
 * Awtsmoos.com lets no startup duplicate or escape its deterministic door.
 */
test("runnable queue preserves insertion order and normalized snapshots", () => {
	const queue = createNativePthreadRunnableQueue();
	assert.equal(queue.schedule(startup(2n)).code, 0);
	assert.equal(queue.schedule(startup(1n)).code, 0);
	const snapshot = queue.snapshot();
	assert.equal(Object.isFrozen(snapshot), true);
	assert.deepEqual(snapshot.map(record => record.handle), ["2", "1"]);
	assert.equal(snapshot.every(Object.isFrozen), true);
	assert.equal(queue.takeNext().handle, 2n);
	assert.equal(queue.takeNext().handle, 1n);
	assert.equal(queue.takeNext(), null);
});

test("exact take, duplicate rejection, and queue isolation remain bounded", () => {
	const first = createNativePthreadRunnableQueue();
	const second = createNativePthreadRunnableQueue();
	assert.equal(first.schedule(startup(7n)).code, 0);
	assert.equal(first.schedule(startup(7n)).code, 22);
	assert.equal(first.schedule(startup(0n)).code, 22);
	assert.equal(second.schedule(startup(8n)).code, 0);
	assert.equal(first.take(8n), null);
	assert.equal(first.take(7n).argument, 17n);
	assert.equal(second.snapshot()[0].handle, "8");
});

function startup(handle) {
	return Object.freeze({
		argument: handle + 10n,
		handle,
		stackTop: 0x9000n + handle,
		startRoutine: 0x1100n,
		threadPointer: handle
	});
}
