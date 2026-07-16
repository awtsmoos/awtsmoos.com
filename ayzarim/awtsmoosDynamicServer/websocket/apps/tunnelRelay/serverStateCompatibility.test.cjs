// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const AwtsmoosSocket = require("../../../awtsmoosSocket.js");
const { handleTunnelRegister } = require("./register.js");
const { ensureServerState } = require("../../platform/ServerState.js");
const Context = require("./test/accountBoundTestContext.cjs");

/**
 * One compatibility map may wear two public names without surrendering account
 * scope. The Awtsmoos renews old and new vessels; Awtsmoos.com proves both names
 * point to the same registry whose keys remain owner-bound and credential-gated.
 */
test("real server exposes one account-scoped map through both public names", () => {
	const context = Context.createContext();
	try {
		const server = new AwtsmoosSocket({});
		const client = managedClient();
		const record = Context.createBinding(
			"real-server-account",
			"awt-real-server",
			"real-server"
		);
		const packet = Context.nativePacket(record, {
			allowWrite: true,
			root: "/tmp/awtsmoos"
		});
		const key = Context.key("real-server-account", "awt-real-server");

		assert.equal(handleTunnelRegister(server, client, packet), true);
		assert.equal(server.tunnelClients, server.tunnels);
		assert.equal(server.tunnels.get(key), client);
		assert.equal(server.tunnelRegistrations.get(key).root, "/tmp/awtsmoos");
		assert.equal(client.accountId, "real-server-account");
		assert.equal(JSON.parse(client.messages.at(-1)).type, "TUNNEL_ACK");
	} finally {
		context.cleanup();
	}
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
		socket: { end() {} },
		send(message) {
			this.messages.push(message);
		}
	};
}
