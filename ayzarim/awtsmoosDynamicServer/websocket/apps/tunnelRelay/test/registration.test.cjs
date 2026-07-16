// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { handleTunnelRegister } = require("../register.js");
const Context = require("./accountBoundTestContext.cjs");
const Fixture = require("./registrationTestFixtures.cjs");

/**
 * Registration fencing now stands inside an account-bound vessel. The Awtsmoos
 * renews browser, native owner, restart, and fallback; Awtsmoos.com first proves
 * session or device identity, then compares protocol authority within that key.
 */
function main() {
	const context = Context.createContext();
	try {
		testBrowserReplacement();
		testNativeFencing();
		testInvalidName();
		console.log("B_H account-bound relay registration fencing tests passed");
	} finally {
		context.cleanup();
	}
}

function testBrowserReplacement() {
	const accountId = "browser-account";
	const key = Context.key(accountId, "browser-one");
	const server = { clients: new Set(), tunnels: new Map() };
	const previous = Fixture.socket("legacy", accountId);
	Object.assign(previous, {
		isTunnel: true,
		tunnelName: "browser-one",
		registrationKey: key
	});
	server.tunnels.set(key, previous);

	const browser = Fixture.socket("browser", accountId);
	assert.equal(
		handleTunnelRegister(server, browser, Fixture.browserPacket()),
		true
	);
	assert.equal(previous.closed.code, 4001);
	assert.equal(server.tunnels.get(key), browser);
	assert.equal(server.tunnelClients, server.tunnels);
	assert.equal(browser.accountId, accountId);
	assert.equal(browser.vesselType, "browser-tunnel");
	assert.equal(browser.allowCommands, true);
	assert.equal(browser.capabilityProfile.implementation, "apps-code-browser-agent");
	assert.equal(server.tunnelRegistrations.get(key).root, "awtsmoos://code");
	assert.equal(Fixture.lastMessage(browser).accountBound, true);
}

function testNativeFencing() {
	const server = { clients: new Set(), tunnels: new Map() };
	const record = Context.createBinding("native-account", "native-one", "native");
	const key = Context.key("native-account", "native-one");
	const modern = Fixture.socket("modern");
	assert.equal(
		handleTunnelRegister(server, modern, Context.nativePacket(record)),
		true
	);

	const fallback = Fixture.socket("old-fallback");
	const fallbackPacket = Context.nativePacket(record, {
		agentVersion: "native-local",
		allowCommands: false
	});
	assert.equal(handleTunnelRegister(server, fallback, fallbackPacket), false);
	assert.equal(server.tunnels.get(key), modern);
	assert.equal(fallback.closed.code, 4003);
	assert.equal(
		Fixture.lastMessage(fallback).error,
		"lower_authority_tunnel_owner_active"
	);

	const restart = Fixture.socket("modern-restart");
	assert.equal(
		handleTunnelRegister(server, restart, Context.nativePacket(record)),
		true
	);
	assert.equal(modern.closed.code, 4001);
	assert.equal(server.tunnels.get(key), restart);
}

function testInvalidName() {
	const invalid = Fixture.socket("invalid");
	assert.equal(handleTunnelRegister({}, invalid, { tunnelName: "!!!" }), false);
	assert.equal(Fixture.lastMessage(invalid).error, "invalid_tunnel_name");
}

main();
