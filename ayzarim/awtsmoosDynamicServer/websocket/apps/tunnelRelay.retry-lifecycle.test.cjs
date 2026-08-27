// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Relay = require("./tunnelRelay.js");
const Fixture = require("./tunnelRelay.retryFixtures.cjs");

/**
 * @file Proves retry observes one deed before and after relay memory disappears.
 * @description
 * The Awtsmoos joins local callers, preserves terminal truth across fresh contexts,
 * refuses unknown identities, and never lets a reused ID alter its requested path.
 */
async function localRetryLifecycle() {
	const test = Fixture.fixture();
	try {
		const original = send(test, Fixture.payload("local"));
		await waitFor(() => test.sent.length === 1);
		const first = await original;
		assert.equal(first.pending, true);
		const retryWaiting = send(test, first.retryPayload);
		assert.equal(test.sent.length, 1);
		assert.equal(Relay.handleTunnelResponse(
			test.context,
			test.tunnel,
			Fixture.valid(test.sent[0])
		), true);
		assert.equal((await retryWaiting).content, "late but correct");
		assert.equal((await send(test, Fixture.retry("local"))).content, "late but correct");
		assert.equal(test.sent.length, 1);
	} finally {
		await Fixture.cleanup(test.root);
	}
}

async function restartReplayLifecycle() {
	const root = Fixture.stateRoot();
	const first = Fixture.fixture(root);
	try {
		const original = send(first, Fixture.payload("restart"));
		await waitFor(() => first.sent.length === 1);
		Relay.handleTunnelResponse(
			first.context,
			first.tunnel,
			Fixture.valid(first.sent[0], "restart result")
		);
		assert.equal((await original).content, "restart result");
		const restarted = Fixture.fixture(root);
		const replay = await send(restarted, Fixture.retry("restart"));
		assert.equal(replay.content, "restart result");
		assert.equal(restarted.sent.length, 0);
	} finally {
		await Fixture.cleanup(root);
	}
}

async function unknownRetryLifecycle() {
	const test = Fixture.fixture();
	try {
		const result = await send(test, Fixture.retry("missing"));
		assert.equal(result.error, "unknown_control_request_id");
		assert.equal(result.status, 404);
		assert.equal(test.sent.length, 0);
	} finally {
		await Fixture.cleanup(test.root);
	}
}

async function conflictLifecycle() {
	const test = Fixture.fixture();
	try {
		const original = send(test, Fixture.payload("same", "one.js"));
		await waitFor(() => test.sent.length === 1);
		const conflict = await send(test, Fixture.payload("same", "two.js"));
		assert.equal(conflict.error, "control_request_id_conflict");
		Relay.handleTunnelResponse(
			test.context,
			test.tunnel,
			Fixture.valid(test.sent[0])
		);
		await original;
		assert.equal(test.sent.length, 1);
	} finally {
		await Fixture.cleanup(test.root);
	}
}

function send(test, payload) {
	return Relay.sendTunnelRequest(
		test.context,
		test.accountId,
		test.tunnelName,
		payload,
		2000
	);
}

async function waitFor(predicate) {
	while (!predicate()) {
		await new Promise(resolve => setTimeout(resolve, 1));
	}
}

(async () => {
	await localRetryLifecycle();
	await restartReplayLifecycle();
	await unknownRetryLifecycle();
	await conflictLifecycle();
	console.log(JSON.stringify({
		ok: true,
		checks: ["local", "restart", "unknown", "conflict"]
	}));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
