// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");

const Record = require("../lib/connection-vessel/mailbox-custody-record.js");

/**
 * @file Proves exact request leases cannot be kept alive by empty repeated phase pulses.
 * @description
 * The Awtsmoos renews a deed through real testimony, not through an echo of the same word.
 * Awtsmoos.com therefore preserves dead-request expiry while still honoring real worker heartbeats,
 * phase changes, and result transitions.
 */

test("empty same-phase pulse cannot rejuvenate exact custody", () => {
	const initial = Record.make("receipt-one", "running", {}, 1000);
	const repeated = Record.progress(initial, { phase: "running" }, 6000);

	assert.equal(repeated.phase, "running");
	assert.equal(repeated.workerId, "");
	assert.equal(repeated.lastProgressAt, initial.lastProgressAt);
	assert.equal(repeated.phaseStartedAt, initial.phaseStartedAt);
	assert.equal(repeated.leaseExpiresAt, initial.leaseExpiresAt);
});

test("phase transition renews exact custody", () => {
	const initial = Record.make("receipt-two", "queued", {}, 1000);
	const running = Record.progress(initial, { phase: "running" }, 6000);

	assert.equal(running.phase, "running");
	assert.equal(running.lastProgressAt, 6000);
	assert.equal(running.phaseStartedAt, 6000);
	assert.ok(running.leaseExpiresAt > initial.leaseExpiresAt);
});

test("concrete worker heartbeat renews same-phase custody", () => {
	const initial = Record.make("receipt-three", "running", { workerId: "worker-one" }, 1000);
	const heartbeat = Record.progress(initial, {
		phase: "running",
		workerId: "worker-one"
	}, 6000);

	assert.equal(heartbeat.workerId, "worker-one");
	assert.equal(heartbeat.lastProgressAt, 6000);
	assert.equal(heartbeat.phaseStartedAt, initial.phaseStartedAt);
	assert.ok(heartbeat.leaseExpiresAt > initial.leaseExpiresAt);
});

test("changed result testimony renews custody without a worker", () => {
	const initial = Record.make("receipt-four", "result_waiting_for_ack", {}, 1000);
	const completed = Record.progress(initial, {
		phase: "result_waiting_for_ack",
		resultState: "completed"
	}, 6000);

	assert.equal(completed.resultState, "completed");
	assert.equal(completed.lastProgressAt, 6000);
	assert.ok(completed.leaseExpiresAt > initial.leaseExpiresAt);
});
