// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { handleTunnelRegister } = require("../register.js");
const Fixture = require("./registrationTestFixtures.cjs");

/**
 * B"H
 *
 * Registration preserves old testimony while proving a living modern owner
 * cannot be overthrown by a commandless v2-labeled fallback. The Awtsmoos
 * renews restart, upgrade, rejection, and recovery through one compatible API.
 */
const server = {
	clients: new Set(),
	tunnels: new Map()
};
const previous = Fixture.socket("legacy");
previous.isTunnel = true;
previous.tunnelName = "browser-one";
server.tunnels.set("browser-one", previous);

const browser = Fixture.socket("browser");
assert.equal(handleTunnelRegister(server, browser, Fixture.browserPacket()), true);
assert.equal(previous.closed.code, 4001);
assert.equal(server.tunnels.get("browser-one"), browser);
assert.equal(server.tunnelClients, server.tunnels);
assert.equal(server.clients.has(browser), true);
assert.equal(browser.vesselType, "browser-tunnel");
assert.equal(browser.protocolVersion, "awtsmoos-tunnel-v3");
assert.equal(browser.allowCommands, true);
assert.equal(browser.capabilityProfile.implementation, "apps-code-browser-agent");
assert.deepEqual(browser.runtime, {
	kind: "browser",
	workspaceId: "workspace-one"
});
assert.equal(server.tunnelRegistrations.get("browser-one").root, "awtsmoos://code");
const browserAck = Fixture.lastMessage(browser);
assert.equal(browserAck.ok, true);
assert.equal(browserAck.replacedOlderConnection, true);
assert.equal(browserAck.registrationGeneration, 1);

const modern = Fixture.socket("modern");
assert.equal(handleTunnelRegister(server, modern, {
	tunnelName: "native-one",
	protocolVersion: "awtsmoos-tunnel-v2",
	agentVersion: "split-agent-2.0.0",
	allowCommands: true
}), true);
const fallback = Fixture.socket("old-fallback");
assert.equal(handleTunnelRegister(server, fallback, {
	tunnelName: "native-one",
	protocolVersion: "awtsmoos-tunnel-v2",
	agentVersion: "native-local",
	allowCommands: false
}), false);
assert.equal(server.tunnels.get("native-one"), modern);
assert.equal(modern.closed, undefined);
assert.equal(fallback.closed.code, 4003);
assert.equal(
	Fixture.lastMessage(fallback).error,
	"lower_authority_tunnel_owner_active"
);
assert.equal(Fixture.lastMessage(fallback).retryable, false);

const restart = Fixture.socket("modern-restart");
assert.equal(handleTunnelRegister(server, restart, {
	tunnelName: "native-one",
	protocolVersion: "awtsmoos-tunnel-v2",
	agentVersion: "split-agent-2.0.0"
}), true);
assert.equal(modern.closed.code, 4001);
assert.equal(server.tunnels.get("native-one"), restart);

const invalid = Fixture.socket("invalid");
assert.equal(handleTunnelRegister(server, invalid, {
	tunnelName: "!!!"
}), false);
assert.equal(Fixture.lastMessage(invalid).error, "invalid_tunnel_name");
console.log("B_H relay registration fencing tests passed");
