// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Relay = require("./tunnelRelay.js");
const Fixture = require("./tunnelRelay.retryFixtures.cjs");

/**
 * A retry keeps logical identity while transport identity changes. The Awtsmoos
 * renews every attempt; Awtsmoos.com joins local waiters, recovers orphaned relay
 * work, caches terminal truth, and refuses conflicting control request reuse.
 */
async function localRetryLifecycle() {
	const test = Fixture.fixture();
	const first = await send(test, Fixture.payload("local"), 2000);
	assert.equal(first.pending, true);
	const retryWaiting = send(test, first.retryPayload, 2000);
	assert.equal(test.sent.length, 1);
	Relay.handleTunnelResponse(
		test.context,
		test.tunnel,
		Fixture.valid(test.sent[0])
	);
	assert.equal((await retryWaiting).content, "late but correct");
	const completed = await send(test, first.retryPayload, 2000);
	assert.equal(completed.content, "late but correct");
	assert.equal(test.sent.length, 1);
}

async function recoveredRelayLifecycle() {
	const test = Fixture.fixture();
	const retry = {
		action: "retryAction",
		controlRequestId: "orphan",
		requestedAction: "read",
		relayWaitMs: 1000
	};
	const first = send(test, retry, 2000);
	assert.notEqual(test.sent[0].id, "orphan");
	Relay.handleTunnelResponse(
		test.context,
		test.tunnel,
		Fixture.pending(test.sent[0])
	);
	assert.equal((await first).pending, true);

	const second = send(test, retry, 2000);
	Relay.handleTunnelResponse(
		test.context,
		test.tunnel,
		Fixture.valid(test.sent[1], "recovered result")
	);
	assert.equal((await second).content, "recovered result");
	const cached = await send(test, retry, 2000);
	assert.equal(cached.content, "recovered result");
	assert.equal(test.sent.length, 2);
}

async function conflictLifecycle() {
	const test = Fixture.fixture();
	const original = send(test, Fixture.payload("same", "one.js"), 2000);
	const conflict = await send(test, Fixture.payload("same", "two.js"), 2000);
	assert.equal(conflict.error, "control_request_id_conflict");
	Relay.handleTunnelResponse(
		test.context,
		test.tunnel,
		Fixture.valid(test.sent[0])
	);
	await original;
}

function send(test, payload, timeoutMs) {
	return Relay.sendTunnelRequest(
		test.context,
		test.accountId,
		test.tunnelName,
		payload,
		timeoutMs
	);
}

async function main() {
	await localRetryLifecycle();
	await recoveredRelayLifecycle();
	await conflictLifecycle();
	console.log(JSON.stringify({
		ok: true,
		checks: ["local-retry", "recovered-relay", "conflict"]
	}));
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
