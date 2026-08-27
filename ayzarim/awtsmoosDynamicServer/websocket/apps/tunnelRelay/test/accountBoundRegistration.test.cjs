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
 * @file Proves relay registration is account-scoped and keyed by tunnel ID.
 * @description
 * The Awtsmoos renews equal names without merging rightful owners. Awtsmoos.com
 * accepts only persisted identity, stores account plus immutable ID, and rejects
 * forged account fields, crossed credentials, revoked devices, and anonymous tabs.
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
			server.tunnels.get(Context.key("alice", alice.binding.tunnelId)),
			aliceClient
		);
		assert.equal(
			server.tunnels.get(Context.key("bob", bob.binding.tunnelId)),
			bobClient
		);
		assert.equal(
			server.tunnels.has(Context.key("alice", alice.binding.tunnelName)),
			false
		);

		const wrongCredential = Fixture.socket("wrong-credential");
		assert.equal(handleTunnelRegister(server, wrongCredential, {
			...Context.nativePacket(alice),
			deviceCredential: bob.credential
		}), false);
		assert.equal(
			Fixture.lastMessage(wrongCredential).error,
			"invalid_device_credential"
		);

		const missingBinding = Fixture.socket("missing-binding");
		assert.doesNotThrow(() => {
			assert.equal(handleTunnelRegister(server, missingBinding, {
				...Context.nativePacket(alice),
				tunnelId: "tun_missing_binding"
			}), false);
		});
		assert.equal(
			Fixture.lastMessage(missingBinding).error,
			"invalid_device_credential"
		);

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
		assert.equal(
			server.tunnels.get(Context.key("alice", browser.tunnelId)),
			browser
		);
		console.log("BHY account-bound immutable relay registration passed");
	} finally {
		context.cleanup();
	}
}

main();
