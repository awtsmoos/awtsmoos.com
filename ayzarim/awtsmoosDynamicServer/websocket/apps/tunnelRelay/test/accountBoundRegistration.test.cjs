// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Binding = require(
	"../../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/bindingStore.js"
);
const { handleTunnelRegister } = require("../register.js");
const Context = require("./accountBoundTestContext.cjs");
const Fixture = require("./registrationTestFixtures.cjs");

/**
 * The packet may lie about account, name, or credential, but relay memory accepts
 * only persisted truth. The Awtsmoos joins every vessel; Awtsmoos.com keeps Alice
 * and Bob distinct until an explicit grant—not a forged field—changes authority.
 */
function main() {
	const context = Context.createContext();
	try {
		const server = { clients: new Set(), tunnels: new Map() };
		const alice = Context.createBinding("alice", "same-name", "alice");
		const bob = Context.createBinding("bob", "same-name", "bob");
		const aliceClient = Fixture.socket("alice-client");
		const bobClient = Fixture.socket("bob-client");

		assert.equal(handleTunnelRegister(
			server,
			aliceClient,
			Context.nativePacket(alice, { accountId: "mallory" })
		), true);
		assert.equal(aliceClient.accountId, "alice");
		assert.equal(handleTunnelRegister(
			server,
			bobClient,
			Context.nativePacket(bob, { accountId: "alice" })
		), true);
		assert.equal(bobClient.accountId, "bob");
		assert.equal(server.tunnels.size, 2);
		assert.equal(
			server.tunnels.get(Context.key("alice", "same-name")),
			aliceClient
		);
		assert.equal(
			server.tunnels.get(Context.key("bob", "same-name")),
			bobClient
		);

		const wrongCredential = Fixture.socket("wrong-credential");
		assert.equal(handleTunnelRegister(server, wrongCredential, {
			...Context.nativePacket(alice),
			deviceCredential: bob.credential
		}), false);
		assert.equal(Fixture.lastMessage(wrongCredential).error, "invalid_device_credential");

		const crossedBinding = Fixture.socket("crossed-binding");
		assert.equal(handleTunnelRegister(server, crossedBinding, {
			...Context.nativePacket(alice),
			deviceId: bob.binding.deviceId,
			deviceCredential: bob.credential
		}), false);

		assert.equal(Binding.revokeBinding(alice.binding.tunnelId, "alice"), true);
		const revoked = Fixture.socket("revoked");
		assert.equal(
			handleTunnelRegister(server, revoked, Context.nativePacket(alice)),
			false
		);

		const anonymousBrowser = Fixture.socket("anonymous-browser");
		assert.equal(
			handleTunnelRegister(server, anonymousBrowser, Fixture.browserPacket()),
			false
		);
		assert.equal(
			Fixture.lastMessage(anonymousBrowser).error,
			"browser_session_required"
		);

		const browser = Fixture.socket("browser", "alice");
		assert.equal(handleTunnelRegister(server, browser, Fixture.browserPacket({
			accountId: "bob"
		})), true);
		assert.equal(browser.accountId, "alice");
		console.log("BHY account-bound relay adversarial registration passed");
	} finally {
		context.cleanup();
	}
}

main();
