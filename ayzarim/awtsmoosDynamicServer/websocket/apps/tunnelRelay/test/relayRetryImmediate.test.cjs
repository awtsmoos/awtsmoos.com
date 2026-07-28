// B"H

const assert = require("node:assert/strict");
const Canonical = require("../canonicalRequest.js");
const Normalizers = require("../normalizers.js");

const expected = {
	id: "req_retry_immediate",
	controlRequestId: "req_retry_immediate",
	registrationKey: "acct:tun_immutable",
	tunnelName: "awt-friendly",
	routeReference: "tun_immutable",
	requestedAction: "commandWait",
	timeoutMs: 240000
};
const retry = {
	controlRequestId: expected.controlRequestId,
	requestedAction: expected.requestedAction
};

(async () => {
	const record = {
		expected,
		totalTimeoutMs: expected.timeoutMs,
		waiters: new Set()
	};
	const pendingStarted = Date.now();
	const pending = await Canonical.reusePending(
		record,
		expected,
		retry,
		Normalizers.safeRelayWaitMs(5000)
	);
	assert.equal(pending.action, "tunnelRequestPending");
	assert.equal(pending.pending, true);
	assert.equal(pending.waitedMs, 0);
	assert.ok(Date.now() - pendingStarted < 250);
	assert.equal(record.waiters.size, 0);

	const context = {
		tunnelRequestStarts: new Map([
			[
				`${expected.registrationKey}:${expected.id}`,
				{ expected, promise: new Promise(() => {}) }
			]
		])
	};
	const activeStarted = Date.now();
	const active = await Canonical.run({
		context,
		id: expected.id,
		expected,
		retry,
		waitMs: Normalizers.safeRelayWaitMs(5000),
		producer: () => new Promise(() => {})
	});
	assert.equal(active.action, "tunnelRequestPending");
	assert.equal(active.pending, true);
	assert.equal(active.waitedMs, 0);
	assert.ok(Date.now() - activeStarted < 250);

	assert.equal(Normalizers.safeRelayWaitMs(undefined), 3500);
	assert.equal(Normalizers.safeRelayWaitMs(5000), 4000);

	console.log(JSON.stringify({
		ok: true,
		suite: "relay-retry-immediate",
		activeRetryWaitMs: active.waitedMs,
		pendingRetryWaitMs: pending.waitedMs,
		defaultRelayWaitMs: Normalizers.safeRelayWaitMs(undefined),
		maxRelayWaitMs: Normalizers.safeRelayWaitMs(5000)
	}));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
