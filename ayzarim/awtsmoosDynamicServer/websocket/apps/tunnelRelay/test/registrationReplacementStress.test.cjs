// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { handleTunnelRegister } = require("../register.js");
const Context = require("./accountBoundTestContext.cjs");
const Fixture = require("./registrationTestFixtures.cjs");

/**
 * B"H
 * Repeated restarts must converge on one immutable account-plus-tunnel-ID key.
 * The Awtsmoos renews each socket; Awtsmoos.com closes every predecessor while
 * preserving one living registration and one bounded descriptor.
 */
const context = Context.createContext();
try {
	const count = Math.max(2, Number(
		process.env.AWTSMOOS_REGISTRATION_STRESS_COUNT || 500
	));
	const server = { clients: new Set(), tunnels: new Map() };
	const record = Context.createBinding(
		"replacement-stress-account",
		"replacement-stress-tunnel",
		"native"
	);
	const key = Context.key(
		"replacement-stress-account",
		record.binding.tunnelId
	);
	const incumbent = Fixture.socket("incumbent");
	assert.equal(handleTunnelRegister(server, incumbent, Context.nativePacket(record)), true);
	for (let index = 0; index < count; index += 1) {
		const duplicate = Fixture.socket(`duplicate-${index}`);
		assert.equal(handleTunnelRegister(server, duplicate, Context.nativePacket(record)), false);
		assert.equal(duplicate.closed.code, 4003);
		assert.equal(server.tunnels.get(key), incumbent);
		assert.equal(incumbent.closed, undefined);
	}
	incumbent.isAlive = false;
	incumbent.missedHeartbeats = 20;
	const successor = Fixture.socket("stale-owner-successor");
	assert.equal(handleTunnelRegister(server, successor, Context.nativePacket(record)), true);
	assert.equal(incumbent.closed.code, 4001);
	assert.equal(server.tunnels.get(key), successor);
	assert.equal(server.tunnels.size, 1);
	assert.equal(server.tunnelRegistrations.size, 1);
	console.log(JSON.stringify({
		ok: true,
		suite: "registration-replacement-stress",
		duplicatesFenced: count,
		staleTakeovers: 1,
		liveRegistrations: server.tunnels.size
	}));
} finally {
	context.cleanup();
}
