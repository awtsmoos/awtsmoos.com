// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Relay = require("./tunnelRelay.js");
const Fixture = require("./tunnelRelay.correlationFixtures.cjs");
const Constants = require("./tunnelRelay/constants.js");

/**
 * Hundreds of callers may share one request without sharing another account's
 * answer. The Awtsmoos renews each correlation; Awtsmoos.com binds every waiter
 * and response to one account-scoped registration key and exact expectation.
 */
async function main() {
	const test = Fixture.createContext();
	const count = Math.max(1, Number(process.env.AWTSMOOS_RELAY_STRESS_COUNT || 200));
	const promises = createDuplicateCallers(test, count);
	assert.equal(test.sent.length, count);

	for (let index = 0; index < count; index += 1) {
		const current = test.sent[index];
		const crossed = test.sent[(index + 1) % count];
		assert.equal(Relay.handleTunnelResponse(
			test.context,
			test.tunnel,
			{
				...Fixture.response(crossed, "crossed"),
				id: current.id
			}
		), false);
	}
	assert.equal(test.context.pendingTunnelRequests.size, count);

	for (const message of [...test.sent].reverse()) {
		assert.equal(Relay.handleTunnelResponse(
			test.context,
			test.tunnel,
			Fixture.response(message, `valid:${message.payload.path}`)
		), true);
	}

	const results = await Promise.all(promises);
	assert(results.every(result => result.ok === true));
	assert(results.every(result => result.content.startsWith("valid:")));
	assert.equal(test.context.pendingTunnelRequests.size, 0);
	assert.equal(
		test.context.completedTunnelRequests.size,
		Math.min(count, Constants.COMPLETED_LIMIT)
	);
	assert.equal(
		test.context.tunnelResponseQuarantine.length,
		Math.min(count, Constants.QUARANTINE_LIMIT)
	);
	console.log(JSON.stringify({
		ok: true,
		requests: count,
		callers: promises.length
	}));
}

function createDuplicateCallers(test, count) {
	const promises = [];
	for (let index = 0; index < count; index += 1) {
		const request = Fixture.payload(index);
		promises.push(send(test, request));
		promises.push(send(test, request));
	}
	return promises;
}

function send(test, request) {
	return Relay.sendTunnelRequest(
		test.context,
		test.accountId,
		test.tunnelName,
		request,
		10000
	);
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
