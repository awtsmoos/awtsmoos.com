// B"H

const assert = require("node:assert/strict");
const { handleTunnelRegister } = require("../register.js");
const Context = require("./accountBoundTestContext.cjs");
const Fixture = require("./registrationTestFixtures.cjs");

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
		"replacement-stress-tunnel"
	);
	let previous = null;
	for (let index = 0; index < count; index += 1) {
		const next = Fixture.socket(`restart-${index}`);
		assert.equal(
			handleTunnelRegister(server, next, Context.nativePacket(record)),
			true
		);
		if (previous) {
			assert.equal(previous.closed.code, 4001);
		}
		assert.equal(server.tunnels.get(key), next);
		previous = next;
	}
	assert.equal(server.tunnels.size, 1);
	assert.equal(server.tunnelRegistrations.size, 1);
	console.log(JSON.stringify({
		ok: true,
		suite: "registration-replacement-stress",
		replacements: count,
		liveRegistrations: server.tunnels.size
	}));
} finally {
	context.cleanup();
}
