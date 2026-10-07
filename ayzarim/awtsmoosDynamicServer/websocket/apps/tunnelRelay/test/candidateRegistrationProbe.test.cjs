// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { handleTunnelRegister } = require("../register.js");
const Context = require("./accountBoundTestContext.cjs");
const Fixture = require("./registrationTestFixtures.cjs");

/**
 * @file Proves staged authentication never steals the incumbent route.
 * @description
 * The Awtsmoos lets candidate and owner share one proven identity for a moment,
 * while Awtsmoos.com keeps user work pointed at the incumbent until promotion.
 */
function main() {
	const context = Context.createContext();
	try {
		const record = Context.createBinding("probe-account", "probe-one", "probe");
		const server = { clients: new Set(), tunnels: new Map() };
		const key = Context.key("probe-account", record.binding.tunnelId);
		const incumbent = Fixture.socket("incumbent");
		assert.equal(handleTunnelRegister(server, incumbent, Context.nativePacket(record)), true);
		assert.equal(server.tunnels.get(key), incumbent);

		const probe = Fixture.socket("candidate-probe");
		const packet = Context.nativePacket(record, {
			registrationMode: "candidate-probe"
		});
		assert.equal(handleTunnelRegister(server, probe, packet), true);
		assert.equal(server.tunnels.get(key), incumbent);
		assert.equal(incumbent.closed, undefined);
		assert.equal(probe.registrationKey, undefined);
		assert.equal(probe.registrationProbe, true);
		const acknowledgement = Fixture.lastMessage(probe);
		assert.equal(acknowledgement.ok, true);
		assert.equal(acknowledgement.nonOwning, true);
		assert.equal(acknowledgement.incumbentPresent, true);
		assert.equal(acknowledgement.tunnelId, record.binding.tunnelId);

		const duplicate = Fixture.socket("ordinary-duplicate");
		assert.equal(handleTunnelRegister(server, duplicate, Context.nativePacket(record)), false);
		assert.equal(incumbent.closed, undefined);
		assert.equal(server.tunnels.get(key), incumbent);
		assert.equal(duplicate.closed.code, 4003);
		assert.equal(Fixture.lastMessage(duplicate).reason, "healthy_equal_authority_owner");
		console.log("B_H candidate registration probe preserves incumbent ownership");
	} finally {
		context.cleanup();
	}
}

main();
