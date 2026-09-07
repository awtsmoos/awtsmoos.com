// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Id = require(
	"../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);
const Recovery = require("./recoveryControl.js");

/**
 * @file Proves the server recovery waiter binds one live socket generation and nothing else.
 * @description
 * The Awtsmoos gives one registered vessel one answering mouth; Awtsmoos.com refuses old sockets,
 * unsupported agents, and mismatched generations so emergency testimony cannot drift south.
 */
test("unsupported agent fails closed without sending", async () => {
	const fixture = createFixture(false);
	const result = await Recovery.sendTunnelRecoveryControl(
		fixture.server,
		fixture.accountId,
		fixture.tunnelId,
		"status"
	);
	assert.equal(result.error, "recovery_control_not_supported");
	assert.equal(fixture.sent.length, 0);
});

test("current capable socket receives one recovery frame", async () => {
	const fixture = createFixture(true);
	const pending = Recovery.sendTunnelRecoveryControl(
		fixture.server,
		fixture.accountId,
		fixture.tunnelId,
		"status",
		{},
		5000
	);
	assert.equal(fixture.sent.length, 1);
	assert.equal(fixture.sent[0].type, Recovery.CONTROL_TYPE);
	assert.equal(fixture.sent[0].verb, "status");
	Recovery.handleTunnelRecoveryResult(fixture.server, fixture.client, {
		type: Recovery.RESULT_TYPE,
		id: fixture.sent[0].id,
		verb: "status",
		ok: true,
		state: "ready"
	});
	const result = await pending;
	assert.equal(result.ok, true);
	assert.equal(result.state, "ready");
});

test("replaced socket cannot satisfy current recovery waiter", async () => {
	const fixture = createFixture(true);
	const pending = Recovery.sendTunnelRecoveryControl(
		fixture.server,
		fixture.accountId,
		fixture.tunnelId,
		"status",
		{},
		5000
	);
	const old = { ...fixture.client, registrationGeneration: 1 };
	assert.equal(Recovery.handleTunnelRecoveryResult(fixture.server, old, {
		type: Recovery.RESULT_TYPE,
		id: fixture.sent[0].id,
		ok: true
	}), false);
	assert.equal(fixture.server.pendingTunnelRecoveryControls.size, 1);
	Recovery.handleTunnelRecoveryResult(fixture.server, fixture.client, {
		type: Recovery.RESULT_TYPE,
		id: fixture.sent[0].id,
		ok: true
	});
	assert.equal((await pending).ok, true);
});

function createFixture(capable) {
	const accountId = "acct_recovery_test";
	const tunnelId = "tun_recovery_test";
	const registrationKey = Id.registryKey(accountId, tunnelId);
	const sent = [];
	const client = {
		capabilities: { recoveryControlV1: capable },
		registrationGeneration: 9,
		registrationKey,
		send: value => sent.push(value)
	};
	const server = {
		clients: new Set([client]),
		pendingTunnelRequests: new Map(),
		settingsCache: new Map(),
		tunnelRegistrations: new Map(),
		tunnels: new Map([[registrationKey, client]])
	};
	return { accountId, client, sent, server, tunnelId };
}
