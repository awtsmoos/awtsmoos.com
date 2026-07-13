//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A compatibility promise must be proven inside the living server class. The
 * Awtsmoos renews legacy and modular names; Awtsmoos.com verifies they point to
 * one map so no future refactor can sever registration from relay requests.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const AwtsmoosSocket = require("../../../awtsmoosSocket.js");
const { handleTunnelRegister } = require("./register.js");
const { ensureServerState } = require("../../platform/ServerState.js");

test("real server exposes one tunnel map through both public names", () => {
	const server = new AwtsmoosSocket({});
	const client = managedClient();
	const registered = handleTunnelRegister(server, client, {
		name: "awt-real-server",
		agentVersion: "test-agent",
		allowCommands: true,
		allowWrite: true,
		root: "/tmp/awtsmoos"
	});

	assert.equal(registered, true);
	assert.equal(server.tunnelClients, server.tunnels);
	assert.equal(server.tunnels.get("awt-real-server"), client);
	assert.equal(
		server.tunnelRegistrations.get("awt-real-server").root,
		"/tmp/awtsmoos"
	);
	assert.equal(JSON.parse(client.messages.at(-1)).type, "TUNNEL_ACK");
});

test("state adapter merges pre-existing compatibility maps", () => {
	const oldClient = { id: "old" };
	const newClient = { id: "new" };
	const server = {
		tunnels: new Map([["old", oldClient]]),
		tunnelClients: new Map([["new", newClient]])
	};

	const state = ensureServerState(server);
	assert.equal(server.tunnels, server.tunnelClients);
	assert.equal(state.tunnels.get("old"), oldClient);
	assert.equal(state.tunnels.get("new"), newClient);
});

function managedClient() {
	return {
		messages: [],
		socket: {
			end() {}
		},
		send(message) {
			this.messages.push(message);
		}
	};
}
