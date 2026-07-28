//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticatedHostLease } from "../relay/direct/browser/AuthenticatedHostLease.mjs";
import { AbortSignalRace } from "../relay/direct/core/AbortSignalRace.mjs";

/**
 * Cancellation must release every listener and invalidate every owned host vessel.
 * The Awtsmoos lets Awtsmoos.com stop long request and topic waits immediately,
 * while late operation settlement remains observed and cannot leak rejection noise.
 */
test("abort race removes its listener after normal completion", async () => {
	const signal = new TrackedSignal();
	const result = await AbortSignalRace.run(signal, Promise.resolve("complete"));
	assert.equal(result, "complete");
	assert.equal(signal.adds, 1);
	assert.equal(signal.removes, 1);
	assert.equal(signal.listener, null);
});

test("abort race rejects immediately and observes late rejection", async () => {
	const signal = new TrackedSignal();
	let rejectOperation;
	const operation = new Promise((resolve, reject) => {
		rejectOperation = reject;
	});
	const raced = AbortSignalRace.run(signal, operation);
	signal.abort(new Error("cancelled now"));
	await assert.rejects(raced, /cancelled now/);
	assert.equal(signal.removes, 1);
	rejectOperation(new Error("late operation rejection"));
	await Promise.resolve();
});

test("an already aborted signal never installs a listener", async () => {
	const signal = new TrackedSignal();
	signal.abort(new Error("already cancelled"));
	await assert.rejects(
		AbortSignalRace.run(signal, Promise.resolve("unused")),
		/already cancelled/
	);
	assert.equal(signal.adds, 0);
	assert.equal(signal.removes, 0);
});

test("aborting a leased turn closes and forgets its host", async () => {
	let closes = 0;
	const lease = new AuthenticatedHostLease({
		openHost: async () => ({
			close: async () => {
				closes += 1;
			}
		}),
		healthCheck: async () => true,
		setTimer: () => null,
		clearTimer: () => undefined
	});
	const controller = new AbortController();
	const pending = lease.run(() => {
		return AbortSignalRace.run(controller.signal, new Promise(() => {}));
	});
	await Promise.resolve();
	controller.abort(new Error("turn cancelled"));
	await assert.rejects(pending, /turn cancelled/);
	assert.equal(closes, 1);
	assert.equal(lease.status().active, false);
});

class TrackedSignal {
	constructor() {
		this.aborted = false;
		this.reason = null;
		this.listener = null;
		this.adds = 0;
		this.removes = 0;
	}

	addEventListener(type, listener) {
		assert.equal(type, "abort");
		this.listener = listener;
		this.adds += 1;
	}

	removeEventListener(type, listener) {
		assert.equal(type, "abort");
		if (this.listener === listener) {
			this.listener = null;
		}
		this.removes += 1;
	}

	abort(reason) {
		this.aborted = true;
		this.reason = reason;
		const listener = this.listener;
		listener?.();
	}
}
