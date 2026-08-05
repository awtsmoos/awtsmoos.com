// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Pending = require("./envelopePending.js");

/** Proves pending envelopes never invent acceptance before the device ACK. */
test("pending envelope reports every proven relay phase truthfully", () => {
	const expected = {
		controlRequestId: "phase-one", requestedAction: "commandStart",
		tunnelName: "awt-test", routeReference: "tun_test", timeoutMs: 60000
	};
	const reserved = Pending.timeoutEnvelope(expected, 3500, 60000);
	assert.equal(reserved.state, "reserved_pending_dispatch");
	assert.equal(reserved.accepted, false);
	assert.equal(reserved.dispatched, false);
	const dispatched = Pending.timeoutEnvelope(expected, 3500, 60000, {
		dispatchedAt: "2026-08-05T00:00:00.000Z"
	});
	assert.equal(dispatched.state, "dispatched_pending_acceptance");
	assert.equal(dispatched.accepted, false);
	assert.equal(dispatched.unsafeToRedispatch, true);
	const accepted = Pending.timeoutEnvelope(expected, 3500, 60000, {
		dispatchedAt: "2026-08-05T00:00:00.000Z",
		acceptedAt: "2026-08-05T00:00:01.000Z"
	});
	assert.equal(accepted.state, "device_accepted_pending");
	assert.equal(accepted.accepted, true);
	assert.equal(accepted.acceptanceDurable, true);
	const running = Pending.timeoutEnvelope(expected, 3500, 60000, {
		acceptedAt: "2026-08-05T00:00:01.000Z",
		progressAt: "2026-08-05T00:00:02.000Z", progressPhase: "worker_running",
		jobId: "job-one", taskId: "task-one"
	});
	assert.equal(running.state, "running_pending");
	assert.equal(running.jobId, "job-one");
	assert.equal(running.taskId, "task-one");
});
