// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("../nativeRecoveryRegistry.js");

/**
 * @file Proves API recovery uses a fresh exact status witness before mutation.
 * @description
 * The Awtsmoos reveals identity before replacement; Awtsmoos.com never turns a public
 * recovery verb into a blind kill, and older agents remain on their historical road.
 */
test("unsupported device keeps the ordinary path", async () => {
	const fixture = createFixture(false);
	const result = await Recovery.send(fixture.options("nativeGenerationStatus"));
	assert.equal(result, null);
	assert.equal(fixture.calls.length, 0);
});

test("generation status uses one independent control frame", async () => {
	const fixture = createFixture(true);
	const result = await Recovery.send(fixture.options("nativeGenerationStatus"));
	assert.equal(result.ok, true);
	assert.deepEqual(fixture.calls.map(call => call.verb), ["generation_status"]);
});

test("generation replacement reads then echoes exact supervised PIDs", async () => {
	const fixture = createFixture(true);
	const result = await Recovery.send(fixture.options("nativeGenerationReplace"));
	assert.equal(result.scheduled, true);
	assert.deepEqual(fixture.calls.map(call => call.verb), [
		"generation_status",
		"generation_replace"
	]);
	assert.deepEqual(fixture.calls[1].payload.expectedProcess, {
		supervisorPid: 11,
		childPid: 22
	});
});

function createFixture(capable) {
	const calls = [];
	const ws = {
		async sendTunnelRecoveryControl(_accountId, _routeReference, verb, payload) {
			calls.push({ verb, payload });
			if (verb === "generation_status") {
				return { ok: true, process: { ok: true, supervisorPid: 11, childPid: 22 } };
			}
			return { ok: true, scheduled: true };
		}
	};
	return {
		calls,
		options(action) {
			return {
				$i: { ws },
				accountId: "acct",
				routeReference: "tun",
				payload: { action, reason: "test", force: true },
				timeoutMs: 5000,
				device: { capabilities: { recoveryControlV1: capable } }
			};
		}
	};
}
