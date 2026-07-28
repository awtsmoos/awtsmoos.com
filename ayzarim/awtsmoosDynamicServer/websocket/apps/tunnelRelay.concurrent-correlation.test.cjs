// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const Relay = require("./tunnelRelay.js");
const Fixture = require("./tunnelRelay.correlationFixtures.cjs");
const Helpers = require("./tunnelRelay.concurrentHelpers.cjs");
const Constants = require("./tunnelRelay/constants.js");

/**
 * @file Proves concurrent callers converge on account-scoped durable results.
 * @description
 * The Awtsmoos lets short HTTP windows close while one deed continues. Awtsmoos.com
 * quarantines crossed answers and replays truth without another socket dispatch.
 */
async function main() {
	const test = Fixture.createContext();
	const count = Math.max(
		1,
		Number(process.env.AWTSMOOS_RELAY_STRESS_COUNT || 200)
	);
	try {
		const entries = Helpers.createDuplicateCallers(
			Relay,
			test,
			Fixture,
			count
		);
		await Helpers.waitFor(() => test.sent.length === count, 30000);
		quarantineCrossedResponses(test, count);
		assert.equal(test.context.pendingTunnelRequests.size, count);
		completeValidResponses(test);
		const initial = await Promise.all(entries.map(entry => entry.promise));
		await Helpers.waitFor(
			() => test.context.pendingTunnelRequests.size === 0,
			30000
		);
		const final = await Promise.all(entries.map((entry, index) => (
			initial[index].ok === true && initial[index].pending !== true
				? initial[index]
				: Helpers.send(Relay, test, Helpers.retryPayload(entry.request))
		)));
		assert(final.every(result => result.ok === true));
		const invalidContent = final.filter(result =>
			typeof result.content !== "string" ||
			!result.content.startsWith("valid:")
		);
		assert.deepEqual(
			invalidContent,
			[],
			JSON.stringify(invalidContent.slice(0, 10), null, 2)
		);
		assert.equal(
			test.sent.filter(message => message.type === "TUNNEL_REQUEST").length,
			count
		);
		assert.equal(
			test.sent.filter(message => message.type === "TUNNEL_RESPONSE_ACK").length,
			count * 2
		);
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
			callers: entries.length,
			initialPending: initial.filter(result => !result.ok).length
		}));
	} finally {
		await fsp.rm(test.root, { recursive: true, force: true });
	}
}

function quarantineCrossedResponses(test, count) {
	const requests = test.sent.filter(message => message.type === "TUNNEL_REQUEST");
	for (let index = 0; index < count; index += 1) {
		const current = requests[index];
		const crossed = requests[(index + 1) % count];
		assert.equal(Relay.handleTunnelResponse(
			test.context,
			test.tunnel,
			{
				...Fixture.response(crossed, "crossed"),
				id: current.id
			}
		), false);
	}
}

function completeValidResponses(test) {
	const requests = test.sent.filter(message => message.type === "TUNNEL_REQUEST");
	for (const message of requests.reverse()) {
		assert.equal(Relay.handleTunnelResponse(
			test.context,
			test.tunnel,
			Fixture.response(message, `valid:${message.payload.path}`)
		), true);
	}
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
