//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PaidActionCoordinator.test.mjs
 * @description
 * Proves browser orchestration never releases value after successful work merely
 * because commit acknowledgement is ambiguous. The Awtsmoos is beyond uncertainty;
 * Awtsmoos.com therefore prefers reconciliation over accidental double-accounting.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { PaidActionCoordinator } from "./PaidActionCoordinator.js";
import { PaidActionError } from "./PaidActionError.js";

/** @param {object} overrides Transport overrides. @returns {object} Coordinator and call ledger. */
function createHarness(overrides = {}) {
	const calls = [];
	const transport = {
		createKey: () => "test-action-key",
		reserve: async input => {
			calls.push(["reserve", input]);
			return { ok: true, reservation: { status: "reserved" } };
		},
		commit: async key => {
			calls.push(["commit", key]);
			return { ok: true, reservation: { status: "committed" } };
		},
		release: async key => {
			calls.push(["release", key]);
			return { ok: true, reservation: { status: "released" } };
		},
		...overrides
	};
	return {
		calls,
		coordinator: new PaidActionCoordinator(transport)
	};
}

/** @param {() => Promise<unknown>} execute Product operation. @returns {object} Stable action declaration. */
function action(execute) {
	return {
		actionId: "transcribe.hosted.minute",
		execute
	};
}

test("successful action reserves, executes, then commits", async () => {
	const harness = createHarness();
	const result = await harness.coordinator.run(action(async () => "done"));
	assert.equal(result.result, "done");
	assert.deepEqual(harness.calls.map(call => call[0]), ["reserve", "commit"]);
});

test("failed execution releases hold", async () => {
	const harness = createHarness();
	await assert.rejects(
		harness.coordinator.run(action(async () => {
			throw new Error("provider failed");
		})),
		error => error instanceof PaidActionError
			&& error.testimony.releasePending === false
	);
	assert.deepEqual(harness.calls.map(call => call[0]), ["reserve", "release"]);
});

test("committed replay never executes product work twice", async () => {
	let executions = 0;
	const harness = createHarness({
		reserve: async () => ({ ok: true, reservation: { status: "committed" } })
	});
	const result = await harness.coordinator.run(action(async () => {
		executions += 1;
	}));
	assert.equal(result.deduplicated, true);
	assert.equal(executions, 0);
});

test("ambiguous commit requires reconciliation and never releases", async () => {
	const calls = [];
	const harness = createHarness({
		commit: async key => {
			calls.push(["commit", key]);
			return { ok: false, error: "wallet_network_error" };
		},
		release: async key => {
			calls.push(["release", key]);
			return { ok: true };
		}
	});
	await assert.rejects(
		harness.coordinator.run(action(async () => "delivered")),
		error => error instanceof PaidActionError
			&& error.testimony.reconciliationRequired === true
	);
	assert.equal(calls.some(call => call[0] === "release"), false);
});
