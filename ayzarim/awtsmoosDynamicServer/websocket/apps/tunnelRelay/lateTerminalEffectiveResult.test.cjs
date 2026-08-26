// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Canonical = require("./canonicalEnvelopes.js");
const State = require("./state.js");

/**
 * @file Proves late authenticated native completion outranks an earlier relay timeout.
 * @description
 * The Awtsmoos lets the clock record that a caller waited too long, yet Awtsmoos.com
 * refuses to let that clock deny a deed the native vessel later proves was manifested.
 * The timeout remains history; the verified completion becomes effective truth.
 */
test("late terminal completion becomes effective without erasing timeout history", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-late-terminal-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const context = { tunnelRelayStateRoot: root };
	const expected = expectation("late-write");

	await State.claim(context, expected.id, expected);
	await State.rememberAccepted(context, expected.id, expected, {
		acceptedAt: new Date().toISOString()
	});
	await State.rememberExpired(context, expected.id, {
		ok: false,
		error: "tunnel_request_expired",
		status: 504
	}, expected);

	await State.rememberReconciliation(context, expected.id, {
		ok: true,
		action: "write",
		afterHash: "manifested-on-device"
	}, expected, {
		registrationKey: expected.registrationKey,
		observedAt: new Date().toISOString()
	});

	const restarted = { tunnelRelayStateRoot: root };
	const record = await State.hydrate(restarted, expected.id, expected);
	assert.equal(record.state, "expired");
	assert.equal(record.data.error, "tunnel_request_expired");
	assert.equal(record.reconciliation.data.ok, true);

	const observed = Canonical.fromRecord(record, expected);
	assert.equal(observed.ok, true);
	assert.equal(observed.afterHash, "manifested-on-device");
	assert.equal(observed.reconciliation.originalState, "expired");
	assert.equal(observed.reconciliation.originalData.status, 504);

	const effective = State.completed(restarted, expected.id, expected);
	assert.equal(effective.data.ok, true);
	assert.equal(effective.sourceState, "expired");
});

/** Returns one complete immutable expectation for a simulated filesystem mutation. */
function expectation(id) {
	return {
		id,
		controlRequestId: id,
		clientRequestId: id,
		registrationKey: "account::tunnel",
		requestedAction: "write",
		tunnelName: "awt-test",
		timeoutMs: 100
	};
}
